import { NextRequest, NextResponse } from "next/server";
import { createEmbedding } from "../../../../libs/openai";
import { queryVectors, rerank } from "../../../../libs/pinecone";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

// Rate limiter storage
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Rate limit configuration
const RATE_LIMIT = 10; // requests per window
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds

function getRateLimitKey(request: NextRequest): string {
  // Get IP from headers (works with Vercel)
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0] : "unknown";
  return ip;
}

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  // Clean up expired entries periodically
  if (rateLimitMap.size > 1000) {
    for (const [key, value] of rateLimitMap.entries()) {
      if (now > value.resetTime) {
        rateLimitMap.delete(key);
      }
    }
  }

  if (!record || now > record.resetTime) {
    // First request or window expired
    rateLimitMap.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    });
    return { allowed: true, remaining: RATE_LIMIT - 1 };
  }

  if (record.count >= RATE_LIMIT) {
    // Rate limit exceeded
    return { allowed: false, remaining: 0 };
  }

  // Increment count
  record.count++;
  return { allowed: true, remaining: RATE_LIMIT - record.count };
}

export async function POST(request: NextRequest) {
  try {
    // Check rate limit
    const ip = getRateLimitKey(request);
    const { allowed, remaining } = checkRateLimit(ip);

    if (!allowed) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded. Please try again later.",
          retryAfter: RATE_LIMIT_WINDOW / 1000, // seconds
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": RATE_LIMIT.toString(),
            "X-RateLimit-Remaining": "0",
            "Retry-After": (RATE_LIMIT_WINDOW / 1000).toString(),
          },
        }
      );
    }
    const { query, topK = 10, category = "all" } = await request.json();

    const queryEmbedding = await createEmbedding(query, 512);

    // Build Pinecone filter based on category
    let filter = undefined;
    if (category !== "all") {
      if (category === "smoothies") {
        // Exclude bowls and power eats - handle both cases
        filter = {
          $and: [
            { category: { $nin: ["Smoothie Bowl", "smoothie bowl"] } }, // ✅ Both cases
            { category: { $ne: "Power Eats" } },
          ],
        };
      } else if (category === "bowls") {
        // Match both "Smoothie Bowl" and "smoothie bowl"
        filter = {
          category: { $in: ["Smoothie Bowl", "smoothie bowl"] }, // ✅ Both cases
        };
      } else if (category === "power-eats") {
        // Only Power Eats category
        filter = {
          category: "Power Eats",
        };
      }
    }

    const results = await queryVectors(
      "nutrition-information",
      queryEmbedding,
      topK * 3,
      true,
      filter
    );

    // Prepare documents with rich text
    const documents = results.map((r) => ({
      id: r.id,
      text: [
        r.metadata?.name,
        `Category: ${r.metadata?.category}`,
        r.metadata?.servingSize && `Serving: ${r.metadata.servingSize}`,
        Array.isArray(r.metadata?.availableSizes) &&
          r.metadata.availableSizes.length > 0 &&
          `Sizes: ${r.metadata.availableSizes.join(", ")}`,
        r.metadata?.nutritionSize &&
          `Nutrition based on: ${r.metadata.nutritionSize}`,
        `Calories: ${r.metadata?.nutrition_calories}`,
        `Protein: ${r.metadata?.nutrition_protein}g`,
        `Carbs: ${r.metadata?.nutrition_carbs}g`,
        `Fat: ${r.metadata?.nutrition_fat}g`,
        `Sugar: ${r.metadata?.nutrition_sugar}g`,
        `Fiber: ${r.metadata?.nutrition_fiber}g`,
        Array.isArray(r.metadata?.ingredients) &&
          `Ingredients: ${r.metadata.ingredients.join(", ")}`,
        Array.isArray(r.metadata?.allergens) &&
          r.metadata.allergens.length > 0 &&
          `Allergens: ${r.metadata.allergens.join(", ")}`,
      ]
        .filter(Boolean)
        .join(" | "),
    }));

    const reranked = await rerank(query, documents, topK);

    const rankedDocs = reranked.data.map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (item: any) => {
        const original = results.find(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (r: any) => r.id === item.document.id
        );
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
      }
    );

    const topFiveResults = rankedDocs.slice(0, 5);

    // Better category name for GPT
    const categoryDisplayName =
      category === "all"
        ? "items"
        : category === "smoothies"
        ? "smoothies"
        : category === "bowls"
        ? "smoothie bowls"
        : "power eats";

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful nutrition assistant at Smoothie King. Provide friendly, concise recommendations based on the options found. Focus on how well they match the customer's request.",
        },
        {
          role: "user",
          content: `Customer asked: "${query}"\n\nTop 5 ${categoryDisplayName}:\n${JSON.stringify(
            topFiveResults,
            null,
            2
          )}\n\nProvide a brief, friendly response explaining why these top 5 ${categoryDisplayName} are a great match for their request. Mention key nutrition facts and any important allergen information.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 250,
    });

    return NextResponse.json(
      {
        query,
        category,
        topRecommendation: topFiveResults[0],
        topFive: topFiveResults,
        allResults: rankedDocs,
        total: rankedDocs.length,
        aiResponse: response.choices[0].message.content,
        reranked: true,
      },
      {
        headers: {
          "X-RateLimit-Limit": RATE_LIMIT.toString(),
          "X-RateLimit-Remaining": remaining.toString(),
        },
      }
    );
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
