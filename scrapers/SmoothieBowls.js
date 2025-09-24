const puppeteer = require("puppeteer");

const scrapeMenu = async () => {
  // Launch with slower navigation timeouts and no headless for better stability
  const browser = await puppeteer.launch({
    headless: "new", // Use "new" headless mode
    args: ["--no-sandbox", "--disable-setuid-sandbox"], // For better stability in WSL
  });
  const page = await browser.newPage();

  // Increase default timeout
  page.setDefaultNavigationTimeout(60000); // 60 seconds

  // Navigate to the URL with retry logic
  let retries = 3;
  while (retries > 0) {
    try {
      await page.goto(
        "https://www.smoothieking.com/menu/smoothies/smoothie-bowls",
        {
          waitUntil: "networkidle2",
          timeout: 60000,
        }
      );
      break; // Successfully loaded
    } catch (error) {
      retries--;
      console.log(`Failed to load initial page, retrying... (${retries} left)`);
      await new Promise((res) => setTimeout(res, 3000));
    }
  }

  // Set screen size
  await page.setViewport({ width: 1080, height: 1024 });

  const bowls = [];
  let keepScraping = true;
  let scrapeCount = 0;

  while (keepScraping) {
    try {
      // Re-select all grid items on current page
      const gridItems = await page.$$(".grid-item");

      if (scrapeCount >= gridItems.length || gridItems.length === 0) {
        console.log("Finished scraping all items.");
        keepScraping = false;
        break;
      }

      // Process the next unseen item
      const item = gridItems[scrapeCount];

      // Extract info before navigation
      let name = "";
      let image = "";

      try {
        name = await item.$eval(".item-title > h2", (node) =>
          node.textContent.trim()
        );
        image = await item.$eval(".item-info img", (node) =>
          node.getAttribute("src")
        );
        console.log(`Processing bowl ${scrapeCount + 1}: ${name}`);
      } catch (e) {
        console.error(
          `Error extracting basic info for item ${scrapeCount}: ${e.message}`
        );
        scrapeCount++;
        continue;
      }

      // Get details link
      try {
        const detailsLinkEl = await item.$(".item-details-link");
        if (!detailsLinkEl) {
          console.log(`No details link found for ${name}, skipping details.`);
          bowls.push({
            name,
            category: "smoothie bowl",
            image,
            description: "No details available",
            hasAllergens: false,
            allergens: [],
            sizeInformation: {
              bowl: {
                nutritionInformation: {
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
                },
              },
            },
          });
          scrapeCount++;
          continue;
        }

        // Navigate with retry logic
        let navSuccess = false;
        for (let attempt = 0; attempt < 3; attempt++) {
          try {
            await Promise.all([
              page.waitForNavigation({
                waitUntil: "networkidle2",
                timeout: 45000,
              }),
              detailsLinkEl.click(),
            ]);
            navSuccess = true;
            break;
          } catch (navError) {
            console.log(
              `Navigation attempt ${attempt + 1} failed for ${name}: ${
                navError.message
              }`
            );
            await new Promise((res) => setTimeout(res, 3000));
          }
        }

        if (!navSuccess) {
          console.log(
            `Could not navigate to details for ${name} after 3 attempts, skipping.`
          );
          bowls.push({
            name,
            category: "smoothie bowl",
            image,
            description: "Navigation failed",
            hasAllergens: false,
            allergens: [],
            sizeInformation: {
              bowl: {
                nutritionInformation: {
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
                },
              },
            },
          });
          scrapeCount++;
          continue;
        }

        // Successfully navigated, now scrape details
        await new Promise((res) => setTimeout(res, 2000)); // Longer wait for page load

        let description = "";
        try {
          description = await page.$eval(".description", (node) =>
            node.textContent.trim()
          );
        } catch (e) {
          description = "No description found";
          console.log(`No description found for ${name}: ${e.message}`);
        }

        // Extract ingredients
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
            ] // Remove duplicates
          );
        } catch (ingredientErr) {
          console.log(`Error extracting ingredients: ${ingredientErr.message}`);
        }

        // Extract nutrition information
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
          // Get main nutrition callouts (calories, fat, carbs, protein)
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
            nutritionInfo.fat.amount = parseInt(fatText || "0");
            nutritionInfo.fat.unit = fatText.replace(/[0-9]/g, "");

            // Carbs
            const carbsText = await callouts[2].$eval(".large", (node) =>
              node.textContent.trim()
            );
            nutritionInfo.carbs.amount = parseInt(carbsText || "0");
            nutritionInfo.carbs.unit = carbsText.replace(/[0-9]/g, "");

            // Protein
            const proteinText = await callouts[3].$eval(".large", (node) =>
              node.textContent.trim()
            );
            nutritionInfo.protein.amount = parseInt(proteinText || "0");
            nutritionInfo.protein.unit = proteinText.replace(/[0-9]/g, "");
          }

          // Get all nutrition rows
          const nutritionRows = await page.$$(".nutrition-row");
          for (const row of nutritionRows) {
            try {
              const columns = await row.$$(".nutrition-column");
              if (columns.length >= 2) {
                const label = await columns[0].evaluate((node) =>
                  node.textContent.trim()
                );
                const valueText = await columns[1].evaluate((node) =>
                  node.textContent.trim()
                );

                // Extract numeric value and unit
                const value = parseInt(valueText.replace(/[^0-9]/g, ""));
                const unit = valueText.replace(/[0-9]/g, "").trim();

                // Map to our structure
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
            } catch (rowErr) {
              console.log(`Error processing nutrition row: ${rowErr.message}`);
            }
          }
        } catch (nutritionErr) {
          console.log(
            `Error extracting nutrition info: ${nutritionErr.message}`
          );
        }

        // Check for allergens
        try {
          // Look specifically in the nutrition-allergens div
          const allergenElement = await page.$(".nutrition-allergens div");
          if (allergenElement) {
            const allergenText = await allergenElement.evaluate((node) =>
              node.textContent.trim()
            );
            if (allergenText && allergenText.includes("Allergens:")) {
              hasAllergens = true;
              // Extract just the allergen names, removing the "Allergens:" label
              const allergensString = allergenText
                .replace("Allergens:", "")
                .trim();
              // Split by commas if multiple allergens, otherwise use the single value
              allergens = allergensString.includes(",")
                ? allergensString.split(",").map((a) => a.trim())
                : [allergensString];
            }
          }
        } catch (allergenErr) {
          console.log(`No allergens found or error: ${allergenErr.message}`);
        }

        // Store data in our desired format
        bowls.push({
          name,
          category: "smoothie bowl",
          image,
          description,
          hasAllergens,
          allergens,
          ingredients,
          sizeInformation: {
            bowl: {
              nutritionInformation: nutritionInfo,
            },
          },
        });

        // Go back with retry logic
        let backSuccess = false;
        for (let attempt = 0; attempt < 3; attempt++) {
          try {
            await page.goBack({ waitUntil: "networkidle2", timeout: 45000 });
            backSuccess = true;
            break;
          } catch (backError) {
            console.log(
              `Go back attempt ${attempt + 1} failed for ${name}: ${
                backError.message
              }`
            );
            await new Promise((res) => setTimeout(res, 3000));
          }
        }

        if (!backSuccess) {
          console.log(
            `Could not go back after viewing ${name}. Attempting to navigate to main page.`
          );
          try {
            await page.goto(
              "https://www.smoothieking.com/menu/smoothies/smoothie-bowls",
              {
                waitUntil: "networkidle2",
                timeout: 60000,
              }
            );
          } catch (e) {
            console.error("Failed to return to main page. Exiting scrape.");
            keepScraping = false;
            break;
          }
        }

        await new Promise((res) => setTimeout(res, 3000)); // Longer wait after navigation back
      } catch (error) {
        console.error(`General error processing ${name}: ${error.message}`);
      }

      // Increment counter to process next item
      scrapeCount++;
    } catch (outerError) {
      console.error(`Critical error in main loop: ${outerError.message}`);
      keepScraping = false;
      break;
    }
  }

  console.log(`Successfully scraped ${bowls.length} bowls.`);

  // Save the data even if scraping didn't complete
  const fs = require("fs");
  fs.writeFileSync("smoothie_bowls.json", JSON.stringify(bowls, null, 2));
  console.log("Data saved to smoothie_bowls.json");

  await browser.close();
};

scrapeMenu();
