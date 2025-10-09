import { OpenAI } from "openai";
import { Pinecone } from "@pinecone-database/pinecone";
import path from "path";
import fs from "fs";
import { customizationRules } from "../data/scrapedData/customizationRules";

// Initialize clients
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const index = pinecone.index(process.env.PINECONE_INDEX_NAME);

// 1. Query Understanding with OpenAI
async function parseQuery(query: string) {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content:
          "Extract the following from the nutrition query: 1) Product name (e.g., 'gladiator vanilla'), 2) Size requested, 3) Add-on ingredients, 4) Information requested (calories, protein, etc). Return JSON only.",
      },
      { role: "user", content: query },
    ],
    response_format: { type: "json_object" },
    temperature: 0.2,
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error("No content received from OpenAI");
  return JSON.parse(content);
}

// 2. RAG Retrieval - Find matching product information
async function retrieveRelevantInfo(parsedQuery) {
  // Create embedding for the query
  const embedding = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: parsedQuery.productName,
    dimensions: 512,
  });

  // Query Pinecone for similar vectors
  const queryResults = await index.query({
    vector: embedding.data[0].embedding,
    topK: 5,
    includeMetadata: true,
  });

  return queryResults.matches;
}

// 3. Special Gladiator Calculation Logic
function applyGladiatorRules(baseProduct, size, addOns = []) {
  // Handle product not found
  if (!baseProduct) return { error: "Product not found" };

  // Default to first size if not specified
  const sizeInfo =
    Object.keys(baseProduct.sizeInformation).find((s) =>
      s.toLowerCase().includes(size?.toLowerCase() || "")
    ) || Object.keys(baseProduct.sizeInformation)[0];

  // Get base nutrition
  const baseNutrition = {
    ...baseProduct.sizeInformation[sizeInfo].nutritionInformation,
  };

  // For Gladiator smoothies, apply special rules
  if (baseProduct.name.toLowerCase().includes("gladiator")) {
    const rules = customizationRules.gladiator;
    const sizeMultiplier = rules.sizeMultipliers[sizeInfo] || 1.0;

    // Clone the nutrition info to avoid modifying the original
    const resultNutrition = { ...baseNutrition };

    // Base protein doesn't change with size
    if (!rules.baseProtein.affectedByMultiplier) {
      // Keep protein the same regardless of size
    }

    // Process add-ons with scaling
    if (addOns.length > 0) {
      // Logic to look up add-on nutrition and apply the scaling
      // This would use the ingredients database to look up each add-on

      if (rules.addOns.affectedByMultiplier) {
        // Scale add-on nutrition by the size multiplier
        // Example: addOnCalories * sizeMultiplier
      }
    }

    return {
      name: baseProduct.name,
      size: sizeInfo,
      addOns: addOns,
      nutrition: resultNutrition,
      appliedRules: "Gladiator custom scaling rules",
    };
  }

  // For non-Gladiator products, standard calculation applies
  return {
    name: baseProduct.name,
    size: sizeInfo,
    addOns: addOns,
    nutrition: baseNutrition,
    appliedRules: "Standard nutrition calculation",
  };
}

// Main function that combines RAG with custom rules
export async function getNutritionInfo(query: string) {
  // 1. Parse the query
  const parsed = await parseQuery(query);

  // 2. Retrieve relevant products using RAG
  const matches = await retrieveRelevantInfo(parsed);

  // 3. Get the best match
  const bestMatch = matches[0]?.metadata || "default_product";

  // 4. Apply custom rules (especially for Gladiator)
  const result = applyGladiatorRules(bestMatch, parsed.size, parsed.addOns);

  // 5. Generate human-friendly response with RAG context
  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo",
    messages: [
      {
        role: "system",
        content:
          "You are a nutrition expert. Generate a helpful response based on the calculated nutrition information.",
      },
      {
        role: "user",
        content: `Query: "${query}"\n\nCalculated nutrition: ${JSON.stringify(
          result
        )}`,
      },
    ],
    temperature: 0.7,
  });

  return {
    query,
    parsed,
    calculatedResult: result,
    humanReadableResponse: response.choices[0].message.content,
  };
}
