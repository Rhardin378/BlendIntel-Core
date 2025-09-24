const puppeteer = require("puppeteer");
const fs = require("fs");

const NUTRITION_SIZE_LABELS = {
  20: "small(20 oz)",
  32: "medium(32 oz)",
  44: "large(44 oz)",
};

const scrapeSmoothieMenu = async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(60000);

  await page.goto("https://www.smoothieking.com/menu/smoothies", {
    waitUntil: "networkidle2",
    timeout: 60000,
  });
  await page.setViewport({ width: 1080, height: 1024 });

  // Get all categories (skip the first, which is bowls)
  const categories = await page.$$eval(".headline-column", (columns) =>
    columns.slice(1).map((col) => {
      const h3 = col.querySelector("h3.headline-title");
      const category = h3
        ? h3.textContent.replace(/blends?/i, "").trim()
        : "Unknown Category";
      // Find the closest section ancestor to get the smoothies-grid
      let section = col.closest("section");
      let smoothies = [];
      if (section) {
        const smoothiesGrid = section.querySelector(".smoothies-grid");
        if (smoothiesGrid) {
          smoothies = Array.from(
            smoothiesGrid.querySelectorAll(".grid-item")
          ).map((item) => {
            // Extract name and image
            const name = item.querySelector(".item-title h2")
              ? item.querySelector(".item-title h2").textContent.trim()
              : "";
            const image = item.querySelector(".item-info img")
              ? item.querySelector(".item-info img").getAttribute("src")
              : "";
            // Details link
            const detailsLink = item.querySelector(
              ".order-details .item-details-link"
            )
              ? item
                  .querySelector(".order-details .item-details-link")
                  .getAttribute("href")
              : "";
            return { name, image, detailsLink };
          });
        }
      }
      return { category, smoothies };
    })
  );

  const smoothiesData = [];

  for (const cat of categories) {
    for (const smoothie of cat.smoothies) {
      // Open details page in the same tab
      if (!smoothie.detailsLink) continue;
      try {
        await page.goto(smoothie.detailsLink, {
          waitUntil: "networkidle2",
          timeout: 60000,
        });
        await new Promise((res) => setTimeout(res, 1000));

        // Ingredients
        let ingredients = [];
        try {
          ingredients = await page.$$eval(
            ".ingredient-list button",
            (buttons) => [
              ...new Set(
                buttons.map((button) =>
                  button.textContent.trim().replace(/,$/, "")
                )
              ),
            ]
          );
        } catch {}

        // Caffeine and allergens
        let caffeine = null;
        let hasCaffeine = false;
        let allergens = [];
        let hasAllergens = false;

        try {
          const allergenDivs = await page.$$eval(
            ".nutrition-allergens div",
            (divs) => divs.map((div) => div.textContent.trim())
          );
          for (const divText of allergenDivs) {
            if (divText.toLowerCase().includes("caffeine:")) {
              const match = divText.match(/caffeine:\s*([0-9.]+)\s*mg/i);
              if (match) {
                caffeine = { amount: parseFloat(match[1]), unit: "mg" };
                hasCaffeine = true;
              }
            }
            if (divText.toLowerCase().includes("allergens:")) {
              const allergensString = divText.replace(/allergens:/i, "").trim();
              if (allergensString) {
                hasAllergens = true;
                allergens = allergensString
                  .split(",")
                  .map((a) => a.trim())
                  .filter(Boolean);
              }
            }
          }
        } catch {}

        // Nutrition info for each size
        const sizeInformation = {};
        // Find all tab buttons
        const tabButtons = await page.$$(".nutrition-tab-wrapper .tab button");
        for (let i = 0; i < tabButtons.length; i++) {
          // Click the tab if not active
          const isActive = await tabButtons[i].evaluate((btn) =>
            btn.classList.contains("active")
          );
          if (!isActive) {
            await tabButtons[i].click();
            await new Promise((res) => setTimeout(res, 1000));
          }
          // Get size label (20, 32, 44)
          const sizeLabel = await tabButtons[i].evaluate((btn) =>
            btn.querySelector("span:not(.visually-hidden)")?.textContent.trim()
          );
          const mappedLabel = NUTRITION_SIZE_LABELS[sizeLabel] || sizeLabel;

          // Nutrition callouts
          let nutritionInfo = {
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

          try {
            const callouts = await page.$$(".nutrition-callout");
            if (callouts.length >= 4) {
              // Calories
              nutritionInfo.calories = parseInt(
                (await callouts[0].$eval(".large", (node) =>
                  node.textContent.trim()
                )) || "0"
              );
              // Fat
              const fatText = await callouts[1].$eval(".large", (node) =>
                node.textContent.trim()
              );
              nutritionInfo.fat.amount = parseFloat(fatText) || 0;
              nutritionInfo.fat.unit = fatText.replace(/[0-9.]/g, "");
              // Carbs
              const carbsText = await callouts[2].$eval(".large", (node) =>
                node.textContent.trim()
              );
              nutritionInfo.carbs.amount = parseFloat(carbsText) || 0;
              nutritionInfo.carbs.unit = carbsText.replace(/[0-9.]/g, "");
              // Protein
              const proteinText = await callouts[3].$eval(".large", (node) =>
                node.textContent.trim()
              );
              nutritionInfo.protein.amount = parseFloat(proteinText) || 0;
              nutritionInfo.protein.unit = proteinText.replace(/[0-9.]/g, "");
            }
            // Nutrition rows
            const nutritionRows = await page.$$(".nutrition-row");
            for (const row of nutritionRows) {
              const columns = await row.$$(".nutrition-column");
              if (columns.length >= 2) {
                const label = await columns[0].evaluate((node) =>
                  node.textContent.trim()
                );
                const valueText = await columns[1].evaluate((node) =>
                  node.textContent.trim()
                );
                const value =
                  parseFloat(valueText.replace(/[^0-9.]/g, "")) || 0;
                const unit = valueText.replace(/[0-9.]/g, "").trim();
                if (label.includes("Saturated Fat")) {
                  nutritionInfo.saturated_fat.amount = value;
                  nutritionInfo.saturated_fat.unit = unit;
                } else if (label.includes("Cholesterol")) {
                  nutritionInfo.cholesterol.amount = value;
                  nutritionInfo.cholesterol.unit = unit;
                } else if (label.includes("Fiber")) {
                  nutritionInfo.fiber.amount = value;
                  nutritionInfo.fiber.unit = unit;
                } else if (
                  label.includes("Sugar") &&
                  !label.includes("Added")
                ) {
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
          } catch {}

          // Add caffeine if present
          if (caffeine) {
            nutritionInfo.caffeine = caffeine;
          }

          sizeInformation[mappedLabel] = {
            nutritionInformation: nutritionInfo,
          };
        }

        // Description
        let description = "";
        try {
          description = await page.$eval(".description", (node) =>
            node.textContent.trim()
          );
        } catch {}

        smoothiesData.push({
          name: smoothie.name,
          category: cat.category,
          image: smoothie.image,
          ingredients,
          hasAllergens,
          hasCaffeine,
          allergens,
          sizeInformation,
          description,
        });

        // Go back to main menu
        await page.goto("https://www.smoothieking.com/menu/smoothies", {
          waitUntil: "networkidle2",
          timeout: 60000,
        });
        await new Promise((res) => setTimeout(res, 1000));
      } catch (err) {
        console.log(`Error processing ${smoothie.name}: ${err.message}`);
      }
    }
  }

  fs.writeFileSync("smoothies.json", JSON.stringify(smoothiesData, null, 2));
  console.log("Data saved to smoothies.json");

  await browser.close();
};

scrapeSmoothieMenu();
