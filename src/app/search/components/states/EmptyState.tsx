import Image from "next/image";
import { useSearch } from "@/contexts/SearchContext";

const SUGGESTIONS = {
  all: [
    {
      emoji: "💪",
      text: "High protein",
      query: "High protein with strawberries",
    },
    { emoji: "🏃", text: "Post-workout", query: "Low calorie post-workout" },
    { emoji: "🌱", text: "Vegan option", query: "Vegan under 300 calories" },
  ],
  smoothies: [
    { emoji: "💪", text: "High protein", query: "High protein smoothie" },
    { emoji: "🏃", text: "Low calorie", query: "Low calorie fruit smoothie" },
    { emoji: "🍍", text: "Tropical", query: "Something with pineapple" },
  ],
  bowls: [
    { emoji: "🍓", text: "Berry bowl", query: "Bowl with berries" },
    { emoji: "🌾", text: "High fiber", query: "High fiber breakfast bowl" },
    { emoji: "🥜", text: "PB bowl", query: "Bowl with peanut butter" },
  ],
  "power-eats": [
    { emoji: "💪", text: "High protein", query: "High protein breakfast" },
    { emoji: "⚡", text: "Quick snack", query: "Quick protein snack" },
    { emoji: "🍞", text: "Toast", query: "Healthy toast option" },
  ],
};

export function EmptyState() {
  const { category, setInputValue } = useSearch();

  const suggestions = SUGGESTIONS[category];
  const categoryLabel =
    category === "all" ? "menu item" : category.replace("-", " ");

  return (
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
        Ask me anything about nutrition, ingredients, or find the perfect{" "}
        {categoryLabel} for your goals
      </p>

      <div className="mb-8 px-4 py-2 bg-blue-50 rounded-full border border-blue-200">
        <span className="text-sm font-medium text-blue-700">
          {category === "all" && "⭐ Searching all menu items"}
          {category === "smoothies" && "🥤 Searching smoothies only"}
          {category === "bowls" && "🍓 Searching bowls only"}
          {category === "power-eats" && "💪 Searching power eats only"}
        </span>
      </div>

      <div className="flex flex-wrap gap-2 justify-center max-w-2xl">
        {suggestions.map((suggestion, idx) => (
          <button
            key={idx}
            onClick={() => setInputValue(suggestion.query)}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors"
          >
            {suggestion.emoji} {suggestion.text}
          </button>
        ))}
      </div>
    </div>
  );
}
