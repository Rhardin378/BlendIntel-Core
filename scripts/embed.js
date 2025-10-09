import fs from "fs";
import path from "path";
import { createEmbeddings } from "../libs/openai.js";
import dotenv from "dotenv";
import { fileURLToPath, pathToFileURL } from "url";

// Resolve root (this file is in scripts/)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "..", ".env") });

console.log(process.env.OPEN_AI_API_KEY);
// Helper to load and parse JSON or TS rule files
async function loadJsonOrTs(filePath) {
  if (filePath.endsWith(".json")) {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } else if (filePath.endsWith(".ts")) {
    // For TS files, use dynamic import to get the exported object (assumes default export)
    // You may need to adjust this if your TS files export differently
    const fileModule = await import(filePath);
    return fileModule.default;
  }
  return [];
}

async function embedAndSave({ name, filePath, textFn }) {
  console.log(process.env.OPENAI_API_KEY);
  console.log(`Processing ${name}...`);
  const data = await loadJsonOrTs(filePath);

  const items = Array.isArray(data) ? data : [data];
  const texts = items.map(textFn);

  console.log(`Creating embeddings for ${name}...`);
  const embeddings = await createEmbeddings(texts, 512);

  const vectors = items.map((item, index) => ({
    id: item.id || `${name}_${index}`,
    values: embeddings[index],
    metadata: { ...item },
  }));

  const outputDir = path.join(__dirname, "..", "output");
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const outputPath = path.join(outputDir, `${name}_vectors.json`);
  fs.writeFileSync(outputPath, JSON.stringify(vectors, null, 2));
  console.log(`✅ ${vectors.length} ${name} vectors saved to ${outputPath}`);
}
async function main() {
  try {
    const dataDir = path.join(
      path.dirname(new URL(import.meta.url).pathname),
      "..",
      "data",
      "scrapedData"
    );
    console.log(dataDir);
    await embedAndSave({
      name: "ingredients",
      filePath: path.join(dataDir, "ingredients.json"),
      textFn: (item) =>
        [
          item.name,
          item.description,
          `Nutrition: ${item.nutrition ? JSON.stringify(item.nutrition) : ""}`,
          `Allergens: ${item.allergens?.join(", ")}`,
          `Serving Size: ${item.servingSize}`,
        ]
          .filter(Boolean)
          .join(" | "),
    });

    await embedAndSave({
      name: "powerEats",
      filePath: path.join(dataDir, "powerEats.json"),
      textFn: (item) =>
        [
          item.name,
          item.description,
          `Category: ${item.category}`,
          `Ingredients: ${item.ingredients?.join(", ")}`,
          `Nutrition: ${
            item.nutritionInformation
              ? JSON.stringify(item.nutritionInformation)
              : ""
          }`,
          `Allergens: ${item.allergens?.join(", ")}`,
          `Serving Size: ${item.servingSize}`,
        ]
          .filter(Boolean)
          .join(" | "),
    });

    await embedAndSave({
      name: "smoothie_bowls",
      filePath: path.join(dataDir, "smoothie_bowls.json"),
      textFn: (item) =>
        [
          item.name,
          item.description,
          `Category: ${item.category}`,
          `Ingredients: ${item.ingredients?.join(", ")}`,
          `Allergens: ${item.allergens?.join(", ")}`,
          `Sizes: ${
            item.sizeInformation
              ? Object.keys(item.sizeInformation).join(", ")
              : ""
          }`,
          `Nutrition: ${
            item.sizeInformation ? JSON.stringify(item.sizeInformation) : ""
          }`,
        ]
          .filter(Boolean)
          .join(" | "),
    });

    await embedAndSave({
      name: "smoothies",
      filePath: path.join(dataDir, "smoothies.json"),
      textFn: (item) =>
        [
          item.name,
          item.description,
          `Category: ${item.category}`,
          `Ingredients: ${item.ingredients?.join(", ")}`,
          `Allergens: ${item.allergens?.join(", ")}`,
          `Sizes: ${
            item.sizeInformation
              ? Object.keys(item.sizeInformation).join(", ")
              : ""
          }`,
          `Nutrition: ${
            item.sizeInformation ? JSON.stringify(item.sizeInformation) : ""
          }`,
        ]
          .filter(Boolean)
          .join(" | "),
    });

    console.log("🎉 All embeddings created and saved!");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

main();
