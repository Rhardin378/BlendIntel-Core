import Image from "next/image";
import { useSearch } from "@/contexts/SearchContext";
import { AIResponseText } from "../messages/AIResponseText";
import { TopRecommendation } from "./TopRecommendation";
import { AlternativeResults } from "./AlternativeResults";

export function AIResponse() {
  const { results, showAllResults, setShowAllResults } = useSearch();

  if (!results) return null;

  return (
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
          <AIResponseText text={results.aiResponse} />

          <div className="border-t border-gray-200 mb-4"></div>

          <TopRecommendation />

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

          <AlternativeResults />
        </div>
      </div>
    </div>
  );
}
