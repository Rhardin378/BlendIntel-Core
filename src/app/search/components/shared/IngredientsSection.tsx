interface IngredientsSectionProps {
  ingredients: string[];
  id: string;
  isExpanded: boolean;
  onToggle: (id: string) => void;
}

export function IngredientsSection({
  ingredients,
  id,
  isExpanded,
  onToggle,
}: IngredientsSectionProps) {
  if (!ingredients || ingredients.length === 0) return null;

  return (
    <div className="pt-3 border-t border-gray-200">
      <button
        onClick={() => onToggle(id)}
        className="w-full flex items-center justify-between text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
      >
        <span className="flex items-center gap-2">
          🥣 Ingredients ({ingredients.length})
        </span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {isExpanded && (
        <div className="mt-2 text-sm text-gray-600 leading-relaxed animate-slideIn">
          {ingredients.join(", ")}
        </div>
      )}
    </div>
  );
}
