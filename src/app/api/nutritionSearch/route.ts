import { NextRequest, NextResponse } from "next/server";
import { createEmbedding } from "../../../../libs/openai";
import { queryVectors } from "../../../../libs/pinecone";

export async function POST(request: NextRequest) {
  try {
    const { query, topK = 10 } = await request.json();

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    console.log(`Searching for: "${query}"`);

    const queryEmbedding = await createEmbedding(query, 512);

    const results = await queryVectors(
      "nutrition-information",
      queryEmbedding,
      topK,
      true
    );

    const documents = results.map((match) => ({
      id: match.id,
      score: match.score,
      // Nutrition data fields
      name: match.metadata?.name,
      category: match.metadata?.category,
      servingSize: match.metadata?.servingSize,
      allergens: match.metadata?.allergens || [],
      ingredients: match.metadata?.ingredients || [],
      // Size information
      availableSizes: match.metadata?.availableSizes || [],
      nutritionSize: match.metadata?.nutritionSize,
      // Flattened nutrition values
      nutrition_calories: match.metadata?.nutrition_calories,
      nutrition_protein: match.metadata?.nutrition_protein,
      nutrition_carbs: match.metadata?.nutrition_carbs,
      nutrition_fat: match.metadata?.nutrition_fat,
      nutrition_sugar: match.metadata?.nutrition_sugar,
      nutrition_fiber: match.metadata?.nutrition_fiber,
    }));

    return NextResponse.json({
      query,
      documents,
      total: documents.length,
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
