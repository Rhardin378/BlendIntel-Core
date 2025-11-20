import { useSearch } from "@/contexts/SearchContext";

export function NoResultsMessage() {
  const { query, category, setCategory } = useSearch();

  const categoryLabel =
    category === "all" ? "items" : category.replace("-", " ");

  return (
    <div className="flex gap-3 w-full mt-4">
      <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
        🤔
      </div>
      <div className="flex-1 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <p className="text-gray-800 text-sm mb-2">
          No {categoryLabel} found for &ldquo;{query}&rdquo;.
        </p>
        <div className="flex flex-wrap gap-2">
          {category !== "all" && (
            <button
              onClick={() => setCategory("all")}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Search all categories →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
