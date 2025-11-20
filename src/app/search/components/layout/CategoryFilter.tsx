import { useSearch } from "@/contexts/SearchContext";

type CategoryType = "all" | "smoothies" | "bowls" | "power-eats";

const CATEGORIES: { value: CategoryType; label: string; emoji: string }[] = [
  { value: "all", label: "All", emoji: "⭐" },
  { value: "smoothies", label: "Smoothies", emoji: "🥤" },
  { value: "bowls", label: "Bowls", emoji: "🍓" },
  { value: "power-eats", label: "Power Eats", emoji: "💪" },
];

export function CategoryFilter() {
  const { category, setCategory } = useSearch();

  return (
    <div className="flex gap-2 items-center overflow-x-auto pb-1 px-4">
      <span className="text-sm text-gray-600 font-medium mr-1 flex-shrink-0">
        Search:
      </span>
      {CATEGORIES.map((cat) => (
        <button
          key={cat.value}
          onClick={() => setCategory(cat.value)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex-shrink-0 ${
            category === cat.value
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {cat.emoji} {cat.label}
        </button>
      ))}
    </div>
  );
}
