"use client";
import Image from "next/image";
import { useState } from "react";
import { SearchResponse } from "../types/menuItem";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

type CategoryType = "all" | "smoothies" | "bowls" | "power-eats";

// Helper function to get category colors
const getCategoryColor = (category: string) => {
  const lower = category.toLowerCase();

  if (lower.includes("bowl")) {
    return "bg-purple-100 text-purple-700 border-purple-200";
  } else if (lower === "power eats") {
    return "bg-orange-100 text-orange-700 border-orange-200";
  } else if (lower.includes("fit") || lower.includes("protein")) {
    return "bg-blue-100 text-blue-700 border-blue-200";
  } else if (lower.includes("treat") || lower.includes("indulge")) {
    return "bg-pink-100 text-pink-700 border-pink-200";
  } else if (lower.includes("energize") || lower.includes("energy")) {
    return "bg-yellow-100 text-yellow-700 border-yellow-200";
  } else if (lower.includes("well") || lower.includes("immune")) {
    return "bg-green-100 text-green-700 border-green-200";
  } else if (lower.includes("slim") || lower.includes("weight")) {
    return "bg-teal-100 text-teal-700 border-teal-200";
  } else if (lower.includes("regular")) {
    return "bg-amber-100 text-amber-700 border-amber-200";
  }

  return "bg-gray-100 text-gray-700 border-gray-200";
};

// Helper function to get category emoji
const getCategoryEmoji = (category: string) => {
  const lower = category.toLowerCase();

  if (lower.includes("bowl")) return "🍓";
  if (lower === "power eats") return "💪";
  if (lower.includes("fit")) return "🏋️";
  if (lower.includes("protein")) return "💪";
  if (lower.includes("treat")) return "🍰";
  if (lower.includes("energize")) return "⚡";
  if (lower.includes("well") || lower.includes("immune")) return "🌿";
  if (lower.includes("slim") || lower.includes("weight")) return "🎯";
  if (lower.includes("regular")) return "🌾";

  return "🥤";
};

export default function SearchPage() {
  const [query, setQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAllResults, setShowAllResults] = useState<boolean>(false);
  const [category, setCategory] = useState<CategoryType>("all");

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    setShowAllResults(false);

    try {
      const response = await fetch("/api/nutritionSearchRerank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: query.trim(),
          topK: 10,
          category,
        }),
      });

      if (!response.ok)
        throw new Error(`Search failed: ${response.statusText}`);

      const data: SearchResponse = await response.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header - Fixed at top */}
      <header className="border-b border-gray-200 bg-white px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Image
              src="/smoothie-king-logo.svg"
              alt="BlendIntel"
              width={32}
              height={32}
            />
            <h1 className="text-xl font-semibold text-gray-900">BlendIntel</h1>
          </div>
          <button
            onClick={() => {
              setResults(null);
              setQuery("");
              setError(null);
              setShowAllResults(false);
            }}
            className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            New Chat
          </button>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 items-center overflow-x-auto pb-1">
          <span className="text-sm text-gray-600 font-medium mr-1 flex-shrink-0">
            Search:
          </span>
          <button
            onClick={() => setCategory("all")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex-shrink-0 ${
              category === "all"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            ⭐ All
          </button>
          <button
            onClick={() => setCategory("smoothies")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex-shrink-0 ${
              category === "smoothies"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            🥤 Smoothies
          </button>
          <button
            onClick={() => setCategory("bowls")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex-shrink-0 ${
              category === "bowls"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            🍓 Bowls
          </button>
          <button
            onClick={() => setCategory("power-eats")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex-shrink-0 ${
              category === "power-eats"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            💪 Power Eats
          </button>
        </div>
      </header>

      {/* Main content area - Scrollable */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-8">
          {/* Empty state */}
          {!results && !isLoading && (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
              <div className="mb-8">
                <Image
                  src="/smoothie-king-logo.svg"
                  alt="BlendIntel"
                  width={80}
                  height={80}
                  className="opacity-20"
                />
              </div>
              <h2 className="text-3xl font-semibold text-gray-900 mb-3">
                What are you looking for?
              </h2>
              <p className="text-gray-600 mb-2 max-w-md">
                Ask me anything about nutrition, ingredients, or find the
                perfect{" "}
                {category === "all"
                  ? "menu item"
                  : category === "smoothies"
                  ? "smoothie"
                  : category === "bowls"
                  ? "bowl"
                  : "power eat"}{" "}
                for your goals
              </p>

              {/* Active Category Indicator */}
              <div className="mb-8 px-4 py-2 bg-blue-50 rounded-full border border-blue-200">
                <span className="text-sm font-medium text-blue-700">
                  {category === "all" && "⭐ Searching all menu items"}
                  {category === "smoothies" && "🥤 Searching smoothies only"}
                  {category === "bowls" && "🍓 Searching bowls only"}
                  {category === "power-eats" && "💪 Searching power eats only"}
                </span>
              </div>

              {/* Category-specific suggestions */}
              <div className="flex flex-wrap gap-2 justify-center max-w-2xl">
                {category === "all" && (
                  <>
                    <button
                      onClick={() => setQuery("High protein with strawberries")}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors"
                    >
                      💪 High protein
                    </button>
                    <button
                      onClick={() => setQuery("Low calorie post-workout")}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors"
                    >
                      🏃 Post-workout
                    </button>
                    <button
                      onClick={() => setQuery("Vegan under 300 calories")}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors"
                    >
                      🌱 Vegan option
                    </button>
                  </>
                )}

                {category === "smoothies" && (
                  <>
                    <button
                      onClick={() =>
                        setQuery("High protein post-workout smoothie")
                      }
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors"
                    >
                      💪 High protein
                    </button>
                    <button
                      onClick={() => setQuery("Low calorie fruit smoothie")}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors"
                    >
                      🏃 Low calorie
                    </button>
                    <button
                      onClick={() => setQuery("Something with pineapple")}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors"
                    >
                      🍍 Tropical
                    </button>
                  </>
                )}

                {category === "bowls" && (
                  <>
                    <button
                      onClick={() => setQuery("Bowl with berries and granola")}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors"
                    >
                      🍓 Berry bowl
                    </button>
                    <button
                      onClick={() => setQuery("High fiber breakfast bowl")}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors"
                    >
                      🌾 High fiber
                    </button>
                    <button
                      onClick={() => setQuery("Bowl with peanut butter")}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors"
                    >
                      🥜 PB bowl
                    </button>
                  </>
                )}

                {category === "power-eats" && (
                  <>
                    <button
                      onClick={() => setQuery("High protein breakfast")}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors"
                    >
                      💪 High protein
                    </button>
                    <button
                      onClick={() => setQuery("Quick protein snack")}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors"
                    >
                      ⚡ Quick snack
                    </button>
                    <button
                      onClick={() => setQuery("Healthy toast option")}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors"
                    >
                      🍞 Toast
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Chat messages */}
          {(results || isLoading) && (
            <div className="space-y-6">
              {/* User message */}
              <div className="flex gap-4 justify-end">
                <div className="max-w-[80%] bg-blue-600 text-white rounded-2xl rounded-tr-sm px-5 py-3">
                  <p className="text-[15px] leading-relaxed">{query}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                  U
                </div>
              </div>

              {/* Loading state */}
              {isLoading && (
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <Image
                      src="/smoothie-king-logo.svg"
                      alt="AI"
                      width={20}
                      height={20}
                      className="brightness-0 invert"
                    />
                  </div>
                  <div className="max-w-[80%] bg-gray-100 rounded-2xl rounded-tl-sm px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <span
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0ms" }}
                        ></span>
                        <span
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "150ms" }}
                        ></span>
                        <span
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "300ms" }}
                        ></span>
                      </div>
                      <span className="text-sm text-gray-600">
                        Searching{" "}
                        {category === "all"
                          ? "all items"
                          : category === "smoothies"
                          ? "smoothies"
                          : category === "bowls"
                          ? "bowls"
                          : "power eats"}
                        ...
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* AI Response */}
              {results && !isLoading && (
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 mt-1">
                    <Image
                      src="/smoothie-king-logo.svg"
                      alt="AI"
                      width={20}
                      height={20}
                      className="brightness-0 invert"
                    />
                  </div>
                  <div className="flex-1 max-w-[80%]">
                    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                      {/* AI Response Text */}
                      <p className="text-gray-800 text-[15px] leading-relaxed mb-4">
                        {results.aiResponse}
                      </p>

                      {/* Category Badge */}
                      <div className="flex items-center gap-2 mb-3">
                        <span
                          className={`text-xs font-medium px-2.5 py-1 rounded-full border ${getCategoryColor(
                            results.topRecommendation.category
                          )}`}
                        >
                          {getCategoryEmoji(results.topRecommendation.category)}{" "}
                          {results.topRecommendation.category}
                        </span>
                        {results.topRecommendation.nutritionSize && (
                          <span className="text-xs text-gray-500">
                            {results.topRecommendation.nutritionSize}
                          </span>
                        )}
                      </div>

                      <h3 className="font-semibold text-lg text-gray-900 mb-3">
                        {results.topRecommendation.name}
                      </h3>

                      {/* Nutrition Grid */}
                      <div className="grid grid-cols-4 gap-3 mb-4">
                        <div className="text-center">
                          <p className="text-xs text-gray-600 mb-1">Calories</p>
                          <p className="text-lg font-bold text-gray-900">
                            {results.topRecommendation.nutrition_calories}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-600 mb-1">Protein</p>
                          <p className="text-lg font-bold text-blue-600">
                            {results.topRecommendation.nutrition_protein}g
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-600 mb-1">Carbs</p>
                          <p className="text-lg font-bold text-green-600">
                            {results.topRecommendation.nutrition_carbs}g
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-600 mb-1">Fat</p>
                          <p className="text-lg font-bold text-yellow-600">
                            {results.topRecommendation.nutrition_fat}g
                          </p>
                        </div>
                      </div>

                      {/* Allergens */}
                      {results.topRecommendation.allergens?.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-200">
                          {results.topRecommendation.allergens.map(
                            (allergen) => (
                              <span
                                key={allergen}
                                className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded-full border border-red-200"
                              >
                                ⚠️ {allergen}
                              </span>
                            )
                          )}
                        </div>
                      )}

                      {/* Toggle Button */}
                      {results.topFive.length > 1 && (
                        <button
                          onClick={() => setShowAllResults(!showAllResults)}
                          className="w-full mt-3 pt-3 border-t border-gray-200 text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center gap-2 transition-colors"
                        >
                          {showAllResults ? (
                            <>
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <polyline points="18 15 12 9 6 15"></polyline>
                              </svg>
                              Hide other options
                            </>
                          ) : (
                            <>
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <polyline points="6 9 12 15 18 9"></polyline>
                              </svg>
                              Show {results.topFive.length - 1} more option
                              {results.topFive.length - 1 > 1 ? "s" : ""}
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    {/* Collapsible Results */}
                    {showAllResults && results.topFive.length > 1 && (
                      <div className="mt-4 space-y-3">
                        {results.topFive.slice(1).map((item, index) => (
                          <div
                            key={item.id}
                            className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-gray-100 transition-colors animate-slideIn"
                            style={{
                              animationDelay: `${index * 50}ms`, // ✅ Keep the delay
                            }}
                          >
                            {/* Category Badge + Rank */}
                            <div className="flex items-center justify-between mb-2">
                              <span
                                className={`text-xs font-medium px-2 py-0.5 rounded-full border ${getCategoryColor(
                                  item.category
                                )}`}
                              >
                                {getCategoryEmoji(item.category)}{" "}
                                {item.category}
                              </span>
                              <span className="text-xs bg-white text-gray-600 px-2 py-0.5 rounded-full border border-gray-200">
                                #{index + 2}
                              </span>
                            </div>

                            <h4 className="font-semibold text-gray-900 mb-2">
                              {item.name}
                            </h4>

                            {item.nutritionSize && (
                              <p className="text-xs text-gray-600 mb-2">
                                {item.nutritionSize}
                              </p>
                            )}

                            {/* Compact Nutrition */}
                            <div className="flex flex-wrap gap-2 text-sm mb-3">
                              <span className="bg-white px-2 py-1 rounded border border-gray-200">
                                ⚡ {item.nutrition_calories} cal
                              </span>
                              <span className="bg-white px-2 py-1 rounded border border-gray-200">
                                💪 {item.nutrition_protein}g protein
                              </span>
                              <span className="bg-white px-2 py-1 rounded border border-gray-200">
                                🍞 {item.nutrition_carbs}g carbs
                              </span>
                            </div>

                            {/* Allergens */}
                            {item.allergens?.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {item.allergens.map((allergen) => (
                                  <span
                                    key={allergen}
                                    className="text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded-full border border-red-200"
                                  >
                                    ⚠️ {allergen}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                ⚠️
              </div>
              <div className="max-w-[80%] bg-red-50 border border-red-200 rounded-2xl rounded-tl-sm px-5 py-3">
                <p className="text-[15px] text-red-800">{error}</p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Input area - Fixed at bottom */}
      <div className="border-t border-gray-200 bg-white px-4 py-4 sticky bottom-0">
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (!isLoading && query.trim()) {
                      handleSearch();
                    }
                  }
                }}
                placeholder={`Search ${
                  category === "all"
                    ? "all menu items"
                    : category === "smoothies"
                    ? "smoothies"
                    : category === "bowls"
                    ? "bowls"
                    : "power eats"
                }...`}
                rows={1}
                className="w-full px-4 py-3 pr-12 text-[15px] border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none max-h-32"
                disabled={isLoading}
                style={{ minHeight: "48px" }}
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={isLoading || !query.trim()}
              className="w-10 h-10 flex items-center justify-center bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex-shrink-0"
            >
              {isLoading ? (
                <Image
                  src="/smoothie-king-logo.svg"
                  alt="Loading"
                  width={20}
                  height={20}
                  className="animate-spin"
                />
              ) : (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <polyline points="19 12 12 19 5 12"></polyline>
                </svg>
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500 text-center mt-2">
            BlendIntel can make mistakes. Check nutrition facts.
          </p>
        </div>
      </div>
    </div>
  );
}
