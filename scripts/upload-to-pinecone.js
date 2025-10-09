import { upsertVectors } from "../libs/pinecone.js";
import { Pinecone } from "@pinecone-database/pinecone";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

function sanitizeMetadata(raw) {
  if (!raw || typeof raw !== "object") return {};
  const meta = {};

  // Basic fields
  if (raw.id) meta.id = String(raw.id);
  if (raw.name) meta.name = String(raw.name);
  if (raw.category) meta.category = String(raw.category);
  if (raw.servingSize) meta.servingSize = String(raw.servingSize);

  // Allergens (array of strings)
  if (Array.isArray(raw.allergens)) {
    meta.allergens = raw.allergens.filter((a) => typeof a === "string");
  }

  // Ingredients (array of strings, truncate)
  if (Array.isArray(raw.ingredients)) {
    meta.ingredients = raw.ingredients.slice(0, 20).map((i) => String(i));
  }

  // Handle sizeInformation structure (for smoothies/bowls)
  if (raw.sizeInformation && typeof raw.sizeInformation === "object") {
    const sizes = Object.keys(raw.sizeInformation);

    // Store available sizes as array
    meta.availableSizes = sizes;

    // Get the default size for nutrition display
    const defaultSize =
      sizes.find((s) => s.includes("medium")) ||
      sizes.find((s) => s.includes("20")) ||
      sizes[0];

    // Store which size the nutrition data represents
    meta.nutritionSize = defaultSize;

    if (defaultSize) {
      const sizeData = raw.sizeInformation[defaultSize];
      const nutrition = sizeData?.nutritionInformation;

      if (nutrition) {
        // Extract nutrition values
        if (nutrition.calories)
          meta.nutrition_calories =
            typeof nutrition.calories === "number"
              ? nutrition.calories
              : nutrition.calories.amount;

        if (nutrition.protein)
          meta.nutrition_protein =
            typeof nutrition.protein === "number"
              ? nutrition.protein
              : nutrition.protein.amount;

        if (nutrition.carbs)
          meta.nutrition_carbs =
            typeof nutrition.carbs === "number"
              ? nutrition.carbs
              : nutrition.carbs.amount;

        if (nutrition.fat)
          meta.nutrition_fat =
            typeof nutrition.fat === "number"
              ? nutrition.fat
              : nutrition.fat.amount;

        if (nutrition.sugar)
          meta.nutrition_sugar =
            typeof nutrition.sugar === "number"
              ? nutrition.sugar
              : nutrition.sugar.amount;

        if (nutrition.fiber)
          meta.nutrition_fiber =
            typeof nutrition.fiber === "number"
              ? nutrition.fiber
              : nutrition.fiber.amount;
      }
    }
  }

  // Flatten direct nutrition field (for ingredients)
  const nutrition = raw.nutrition || raw.nutritionInformation;
  if (nutrition && typeof nutrition === "object" && !raw.sizeInformation) {
    const fields = ["calories", "protein", "carbs", "fat", "sugar", "fiber"];
    for (const key of fields) {
      const v = nutrition[key];
      if (typeof v === "number") {
        meta[`nutrition_${key}`] = v;
      } else if (v && typeof v.amount === "number") {
        meta[`nutrition_${key}`] = v.amount;
      }
    }
  }

  return meta;
}

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY || "" });

async function createIndexIfNeeded(indexName, dimension) {
  const list = await pc.listIndexes();
  const existing = list.indexes?.find((i) => i.name === indexName);
  if (existing) {
    if (existing.dimension !== dimension) {
      throw new Error(
        `Dimension mismatch: existing=${existing.dimension} expected=${dimension}`
      );
    }
    console.log(`Index '${indexName}' OK (dimension ${dimension})`);
    return;
  }
  console.log(`Creating index '${indexName}' (dim ${dimension})...`);
  await pc.createIndex({
    name: indexName,
    dimension,
    metric: "cosine",
    spec: { serverless: { cloud: "aws", region: "us-east-1" } },
  });
  console.log("Index creation requested. (May take ~60s to be ready)");
}

function loadVectorFile(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed) || parsed.length === 0) {
    console.warn(`Skipping empty file: ${path.basename(filePath)}`);
    return [];
  }
  if (!parsed[0].values) {
    throw new Error(`Invalid vector format in ${filePath}`);
  }
  return parsed;
}

async function chunkedUpsert(indexName, vectors, chunkSize = 100) {
  for (let i = 0; i < vectors.length; i += chunkSize) {
    const slice = vectors.slice(i, i + chunkSize).map((v) => ({
      id: v.id,
      values: v.values,
      metadata: sanitizeMetadata(v.metadata || {}), // <-- ADD THIS LINE
    }));
    await upsertVectors(indexName, slice);
    console.log(
      `  Uploaded ${Math.min(i + chunkSize, vectors.length)}/${vectors.length}`
    );
  }
}

async function uploadAll() {
  const outDir = path.join(process.cwd(), "output");
  if (!fs.existsSync(outDir)) {
    throw new Error(`Output dir not found: ${outDir}`);
  }

  const files = fs
    .readdirSync(outDir)
    .filter((f) => f.endsWith("_vectors.json"))
    .sort();

  if (files.length === 0) {
    throw new Error("No *_vectors.json files found in /output");
  }

  console.log("Discovered vector files:", files.join(", "));

  // Load all vectors & validate dimensions
  const loaded = files.map((f) => ({
    name: f.replace("_vectors.json", ""),
    path: path.join(outDir, f),
    vectors: loadVectorFile(path.join(outDir, f)),
  }));

  const nonEmpty = loaded.filter((l) => l.vectors.length > 0);
  if (nonEmpty.length === 0) throw new Error("All vector files are empty");

  const dimension = nonEmpty[0].vectors[0].values.length;
  for (const l of nonEmpty) {
    const d = l.vectors[0].values.length;
    if (d !== dimension) {
      throw new Error(
        `Dimension mismatch in ${l.path}: ${d} vs expected ${dimension}`
      );
    }
  }

  const indexName = process.env.PINECONE_INDEX_NAME;
  if (!indexName) throw new Error("PINECONE_INDEX_NAME not set");

  await createIndexIfNeeded(indexName, dimension);

  // Upsert each file's vectors
  for (const l of nonEmpty) {
    console.log(`\nUploading '${l.name}' (${l.vectors.length} vectors)...`);
    await chunkedUpsert(indexName, l.vectors, 100);
    console.log(`✅ Finished '${l.name}'`);
  }

  console.log("\nAll vector files uploaded successfully.");
}

uploadAll().catch((err) => {
  console.error("❌ Upload failed:", err);
  process.exit(1);
});
