import { NextRequest, NextResponse } from "next/server";
import { createEmbedding } from "../../../../libs/openai";
import { queryVectors, rerank } from "../../../../libs/pinecone";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

export async function POST(request: NextRequest) {
  try {
    const { query, topK = 10 } = await request.json();

    const queryEmbedding = await createEmbedding(query, 512);

    const results = await queryVectors(
      "nutrition-information",
      queryEmbedding,
      topK * 3,
      true
    );

    // Prepare documents with rich text
    const documents = results.map((r: any) => ({
      id: r.id,
      text: [
        r.metadata?.name,
        `Category: ${r.metadata?.category}`,
        r.metadata?.servingSize && `Serving: ${r.metadata.servingSize}`,
        r.metadata?.availableSizes?.length &&
          `Sizes: ${r.metadata.availableSizes.join(", ")}`,
        r.metadata?.nutritionSize &&
          `Nutrition based on: ${r.metadata.nutritionSize}`,
        `Calories: ${r.metadata?.nutrition_calories}`,
        `Protein: ${r.metadata?.nutrition_protein}g`,
        `Carbs: ${r.metadata?.nutrition_carbs}g`,
        `Fat: ${r.metadata?.nutrition_fat}g`,
        `Sugar: ${r.metadata?.nutrition_sugar}g`,
        `Fiber: ${r.metadata?.nutrition_fiber}g`,
        `Ingredients: ${r.metadata?.ingredients?.join(", ")}`,
        r.metadata?.allergens?.length &&
          `Allergens: ${r.metadata.allergens.join(", ")}`,
      ]
        .filter(Boolean)
        .join(" | "),
    }));

    // ADD THIS: Call rerank
    const reranked = await rerank(query, documents, topK);

    // ADD THIS: Map reranked results back to full metadata
    const rankedDocs = reranked.data.map((item: any) => {
      const original = results.find((r: any) => r.id === item.document.id);
      return {
        id: item.document.id,
        score: original?.score || 0,
        rerankScore: item.score,
        name: original?.metadata?.name,
        category: original?.metadata?.category,
        servingSize: original?.metadata?.servingSize,
        allergens: original?.metadata?.allergens || [],
        ingredients: original?.metadata?.ingredients || [],
        availableSizes: original?.metadata?.availableSizes || [],
        nutritionSize: original?.metadata?.nutritionSize,
        nutrition_calories: original?.metadata?.nutrition_calories,
        nutrition_protein: original?.metadata?.nutrition_protein,
        nutrition_carbs: original?.metadata?.nutrition_carbs,
        nutrition_fat: original?.metadata?.nutrition_fat,
        nutrition_sugar: original?.metadata?.nutrition_sugar,
        nutrition_fiber: original?.metadata?.nutrition_fiber,
      };
    });

    // Generate human-friendly response with GPT-3.5
    const topThreeResults = rankedDocs.slice(0, 3); // Get the best match

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful nutrition assistant at Smoothie King. Provide friendly, concise recommendations based on the smoothie options found. Focus on how well they match the customer's request.",
        },
        {
          role: "user",
          content: `Customer asked: "${query}"\n\nTop 3 recommendations:\n${JSON.stringify(
            topThreeResults,
            null,
            2
          )}\n\nProvide a brief, friendly response explaining why these top 3 smoothies are a great match for their request. Mention key nutrition facts and any important allergen information.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 250,
    });

    return NextResponse.json({
      query,
      // Raw data for nutrition label rendering
      topRecommendation: topThreeResults[0],
      topThree: topThreeResults,
      allResults: rankedDocs,
      total: rankedDocs.length,
      // Human-readable response for chat interface
      aiResponse: response.choices[0].message.content,
      reranked: true,
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
