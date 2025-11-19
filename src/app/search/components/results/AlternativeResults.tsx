import { useSearch } from "@/contexts/SearchContext";
import { ResultCard } from "./ResultCard";

export function AlternativeResults() {
  const { results, showAllResults, expandedIngredients, toggleIngredients } =
    useSearch();

  if (!results || !showAllResults) return null;

  const alternatives = results.topFive.slice(1); // Exclude top recommendation

  if (alternatives.length === 0) return null;

  return (
    <div className="mt-4 space-y-3">
      <p className="text-sm font-medium text-gray-600 mb-3">
        📋 Other Options ({alternatives.length})
      </p>
      {alternatives.map((item, idx) => (
        <ResultCard
          key={item.id}
          item={item}
          rank={idx + 2}
          isExpanded={expandedIngredients.has(item.id)}
          onToggle={toggleIngredients}
        />
      ))}
    </div>
  );
}
