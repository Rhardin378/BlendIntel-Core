import Image from "next/image";
import { useSearch } from "@/contexts/SearchContext";

export function SearchInput() {
  const { inputValue, setInputValue, handleSearch, isLoading, category } =
    useSearch();

  const placeholder = {
    all: "Search all menu items...",
    smoothies: "Search smoothies...",
    bowls: "Search bowls...",
    "power-eats": "Search power eats...",
  }[category];

  return (
    <div className="border-t border-gray-200 bg-white px-4 py-4 sticky bottom-0">
      <div className="max-w-3xl mx-auto">
        <div className="flex gap-3 items-end">
          <div className="flex-1 relative">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (!isLoading && inputValue.trim()) {
                    handleSearch();
                  }
                }
              }}
              placeholder={placeholder}
              rows={1}
              className="w-full px-4 py-3 text-[15px] border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              disabled={isLoading}
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={isLoading || !inputValue.trim()}
            className="w-10 h-10 flex items-center justify-center bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
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
  );
}
