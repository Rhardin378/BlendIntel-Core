"use client";
import Image from "next/image";
import { useState } from "react";
import { SearchResponse } from "../types/menuItem";

export default function SearchPage() {
  const [query, setQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAllResults, setShowAllResults] = useState<boolean>(false);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    setShowAllResults(false); // Reset toggle on new search

    try {
      const response = await fetch("/api/nutritionSearchRerank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim(), topK: 10 }),
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
      <header className="border-b border-gray-200 bg-white px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Image
            src="/smoothie-king-logo.svg"
            alt="BlendIntel"
            width={32}
            height={32}
          />
          <h1 className="text-xl font-semibold text-gray-900">BlendIntel</h1>
        </div>
        <button className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
          New Chat
        </button>
      </header>

      {/* Main content area - Scrollable */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-8">
          {/* Empty state - Show when no results */}
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
                What smoothie are you looking for?
              </h2>
              <p className="text-gray-600 mb-8 max-w-md">
                Ask me anything about nutrition, ingredients, or find the
                perfect smoothie for your goals
              </p>

              {/* Suggestion chips */}
              <div className="flex flex-wrap gap-2 justify-center max-w-2xl">
                <button
                  onClick={() =>
                    setQuery("High protein smoothie with strawberries")
                  }
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors"
                >
                  💪 High protein with strawberries
                </button>
                <button
                  onClick={() => setQuery("Low calorie post-workout option")}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors"
                >
                  🏃 Post-workout recovery
                </button>
                <button
                  onClick={() => setQuery("Vegan smoothie under 300 calories")}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors"
                >
                  🌱 Vegan under 300 cal
                </button>
                <button
                  onClick={() => setQuery("Something with pineapple")}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors"
                >
                  🍍 Tropical smoothie
                </button>
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
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                    <Image
                      src="/smoothie-king-logo.svg"
                      alt="AI"
                      width={20}
                      height={20}
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
                      <span className="text-sm text-gray-600">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}

              {/* AI Response */}
              {results && !isLoading && (
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                    <Image
                      src="/smoothie-king-logo.svg"
                      alt="AI"
                      width={20}
                      height={20}
                    />
                  </div>
                  <div className="flex-1 max-w-[80%]">
                    <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-5 py-4 mb-4">
                      <p className="text-[15px] leading-relaxed text-gray-800">
                        {results.aiResponse}
                      </p>
                    </div>

                    {/* Top Recommendation Card */}
                    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        {results.topRecommendation.name}
                      </h3>
                      <div className="grid grid-cols-4 gap-3 mb-3">
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
                      {results.topRecommendation.allergens.length > 0 && (
                        <div className="flex gap-2 flex-wrap mb-3">
                          {results.topRecommendation.allergens.map(
                            (allergen) => (
                              <span
                                key={allergen}
                                className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded-full"
                              >
                                ⚠️ {allergen}
                              </span>
                            )
                          )}
                        </div>
                      )}

                      {/* Toggle button to show more results */}
                      {results.topThree.length > 1 && (
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
                                strokeLinecap="round"
                                strokeLinejoin="round"
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
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <polyline points="6 9 12 15 18 9"></polyline>
                              </svg>
                              Show {results.topThree.length - 1} more option
                              {results.topThree.length - 1 > 1 ? "s" : ""}
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    {/* Other Top Results - Collapsible */}
                    {showAllResults && results.topThree.length > 1 && (
                      <div className="mt-4 space-y-3">
                        {results.topThree.slice(1).map((smoothie, index) => (
                          <div
                            key={smoothie.id}
                            className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all animate-in slide-in-from-top-2 duration-200"
                            style={{ animationDelay: `${index * 50}ms` }}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h4 className="font-semibold text-gray-900 mb-1">
                                  {smoothie.name}
                                </h4>
                                <p className="text-xs text-gray-600">
                                  {smoothie.category}
                                </p>
                              </div>
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                #{index + 2}
                              </span>
                            </div>
                            <div className="grid grid-cols-4 gap-2">
                              <div className="text-center">
                                <p className="text-xs text-gray-500 mb-0.5">
                                  Cal
                                </p>
                                <p className="text-sm font-bold text-gray-900">
                                  {smoothie.nutrition_calories}
                                </p>
                              </div>
                              <div className="text-center">
                                <p className="text-xs text-gray-500 mb-0.5">
                                  Protein
                                </p>
                                <p className="text-sm font-bold text-blue-600">
                                  {smoothie.nutrition_protein}g
                                </p>
                              </div>
                              <div className="text-center">
                                <p className="text-xs text-gray-500 mb-0.5">
                                  Carbs
                                </p>
                                <p className="text-sm font-bold text-green-600">
                                  {smoothie.nutrition_carbs}g
                                </p>
                              </div>
                              <div className="text-center">
                                <p className="text-xs text-gray-500 mb-0.5">
                                  Fat
                                </p>
                                <p className="text-sm font-bold text-yellow-600">
                                  {smoothie.nutrition_fat}g
                                </p>
                              </div>
                            </div>
                            {smoothie.allergens.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-gray-100">
                                <p className="text-xs text-gray-500">
                                  ⚠️ {smoothie.allergens.join(", ")}
                                </p>
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
                placeholder="Message BlendIntel..."
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
