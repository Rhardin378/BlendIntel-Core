const puppeteer = require("puppeteer");
const fs = require("fs");

const scrapeIngredients = async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(60000);

  try {
    // Navigate to the ingredients page
    await page.goto("https://www.smoothieking.com/menu/smoothies/ingredients", {
      waitUntil: "networkidle2",
      timeout: 60000,
    });

    console.log("Page loaded, extracting ingredients...");
    await page.setViewport({ width: 1080, height: 1024 });

    // Get all ingredient panels/entries
    const ingredientPanels = await page.$$(".entry-wrapper");
    console.log(`Found ${ingredientPanels.length} ingredient panels`);

    const ingredients = [];

    // Process each ingredient panel
    for (let i = 0; i < ingredientPanels.length; i++) {
      try {
        // Get the panel title (ingredient name)
        const panelTitle = await ingredientPanels[i].$eval(
          ".panel-title",
          (el) => el.textContent.trim()
        );
        console.log(`Processing ingredient: ${panelTitle}`);

        // Check if the panel is collapsed (not expanded)
        const isExpanded = await ingredientPanels[i].$eval(
          "button",
          (button) => button.getAttribute("aria-expanded") === "true"
        );

        // If panel is not expanded, click to expand it
        if (!isExpanded) {
          await ingredientPanels[i].$eval("button", (button) => button.click());
          await new Promise((res) => setTimeout(res, 500)); // Wait for panel to expand
        }

        // Get image URL
        let imageUrl = "";
        try {
          imageUrl = await ingredientPanels[i].$eval(
            ".ingredient-column img",
            (img) => img.src
          );
        } catch (err) {
          console.log(`No image found for ${panelTitle}`);
        }

        // Extract nutrition information from callouts
        const nutritionInfo = {
          calories: 0,
          fat: { amount: 0, unit: "g" },
          carbs: { amount: 0, unit: "g" },
          protein: { amount: 0, unit: "g" },
          saturated_fat: { amount: 0, unit: "g" },
          cholesterol: { amount: 0, unit: "mg" },
          fiber: { amount: 0, unit: "g" },
          sugar: { amount: 0, unit: "g" },
          added_sugar: { amount: 0, unit: "g" },
          sodium: { amount: 0, unit: "mg" },
        };

        // Extract calories, fat, carbs, protein from callouts
        const callouts = await ingredientPanels[i].$$(".nutrition-callout");

        if (callouts.length >= 4) {
          // Calories
          nutritionInfo.calories = await callouts[0].$eval(
            ".large",
            (node) => parseInt(node.textContent.trim()) || 0
          );

          // Fat
          const fatText = await callouts[1].$eval(".large", (node) =>
            node.textContent.trim()
          );
          nutritionInfo.fat.amount = parseFloat(fatText) || 0;
          nutritionInfo.fat.unit = fatText.replace(/[0-9.]/g, "").trim() || "g";

          // Carbs
          const carbsText = await callouts[2].$eval(".large", (node) =>
            node.textContent.trim()
          );
          nutritionInfo.carbs.amount = parseFloat(carbsText) || 0;
          nutritionInfo.carbs.unit =
            carbsText.replace(/[0-9.]/g, "").trim() || "g";

          // Protein
          const proteinText = await callouts[3].$eval(".large", (node) =>
            node.textContent.trim()
          );
          nutritionInfo.protein.amount = parseFloat(proteinText) || 0;
          nutritionInfo.protein.unit =
            proteinText.replace(/[0-9.]/g, "").trim() || "g";
        }

        // Extract other nutrition info from rows
        const nutritionRows = await ingredientPanels[i].$$(".nutrition-row");

        for (const row of nutritionRows) {
          const columns = await row.$$(".nutrition-column");

          if (columns.length >= 2) {
            const label = await columns[0].evaluate((node) =>
              node.textContent.trim()
            );
            const valueText = await columns[1].evaluate((node) =>
              node.textContent.trim()
            );

            // Extract numeric value and unit
            const value = parseFloat(valueText.replace(/[^0-9.]/g, "")) || 0;
            const unit = valueText.replace(/[0-9.]/g, "").trim() || "g";

            if (label.includes("Saturated Fat")) {
              nutritionInfo.saturated_fat.amount = value;
              nutritionInfo.saturated_fat.unit = unit;
            } else if (label.includes("Cholesterol")) {
              nutritionInfo.cholesterol.amount = value;
              nutritionInfo.cholesterol.unit = unit;
            } else if (label.includes("Fiber")) {
              nutritionInfo.fiber.amount = value;
              nutritionInfo.fiber.unit = unit;
            } else if (label.includes("Sugar") && !label.includes("Added")) {
              nutritionInfo.sugar.amount = value;
              nutritionInfo.sugar.unit = unit;
            } else if (label.includes("Added Sugar")) {
              nutritionInfo.added_sugar.amount = value;
              nutritionInfo.added_sugar.unit = unit;
            } else if (label.includes("Sodium")) {
              nutritionInfo.sodium.amount = value;
              nutritionInfo.sodium.unit = unit;
            }
          }
        }

        // Extract allergens if any
        let allergens = [];
        let hasAllergens = false;

        try {
          const allergenDiv = await ingredientPanels[i].$(
            ".nutrition-allergens"
          );
          if (allergenDiv) {
            const allergenText = await allergenDiv.evaluate((node) =>
              node.textContent.trim()
            );
            if (allergenText && allergenText.includes("Allergens:")) {
              const allergensStr = allergenText
                .replace("Allergens:", "")
                .trim();
              allergens = allergensStr
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean);
              hasAllergens = allergens.length > 0;
            }
          }
        } catch (err) {
          console.log(`No allergens found for ${panelTitle}`);
        }

        // Add to ingredients array
        ingredients.push({
          name: panelTitle,
          image: imageUrl,
          nutrition: nutritionInfo,
          allergens,
          hasAllergens,
          servingSize: "1 Serving",
        });
      } catch (err) {
        console.error(
          `Error processing ingredient panel ${i + 1}: ${err.message}`
        );
      }
    }

    console.log(`Successfully processed ${ingredients.length} ingredients`);

    // Save the ingredients to a JSON file
    // With this:
    const path = require("path");
    fs.writeFileSync(
      path.resolve(__dirname, "ingredients.json"),
      JSON.stringify(ingredients, null, 2)
    );

    console.log("Ingredients data saved to ingredients.json");
  } catch (error) {
    console.error(`Error scraping ingredients: ${error.message}`);
  } finally {
    await browser.close();
  }
};

scrapeIngredients().catch(console.error);
