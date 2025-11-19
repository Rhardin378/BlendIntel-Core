import { memo } from "react";
import {
  getCategoryColor,
  getCategoryEmoji,
} from "@/app/utils/categoryHelpers";
import { IngredientsSection } from "../shared/IngredientsSection";

interface ResultCardProps {
  item: {
    id: string;
    name: string;
    category: string;
    nutritionSize?: string;
    nutrition_calories: number;
    nutrition_protein: number;
    nutrition_carbs: number;
    nutrition_fat: number;
    allergens?: string[];
    ingredients?: string[];
  };
  rank: number;
  isExpanded: boolean;
  onToggle: (id: string) => void;
}

export const ResultCard = memo(function ResultCard({
  item,
  rank,
  isExpanded,
  onToggle,
}: ResultCardProps) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-gray-100 transition-colors animate-slideIn">
      <div className="flex items-center justify-between mb-2">
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full border ${getCategoryColor(
            item.category
          )}`}
        >
          {getCategoryEmoji(item.category)} {item.category}
        </span>
        <span className="text-xs bg-white text-gray-600 px-2 py-0.5 rounded-full border border-gray-200">
          #{rank}
        </span>
      </div>

      <h4 className="font-semibold text-gray-900 mb-2">{item.name}</h4>

      {item.nutritionSize && (
        <p className="text-xs text-gray-600 mb-2">{item.nutritionSize}</p>
      )}

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

      {item.allergens && item.allergens.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {item.allergens.map((allergen) => (
            <span
              key={allergen}
              className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded border border-red-200"
            >
              ⚠️ {allergen}
            </span>
          ))}
        </div>
      )}

      <IngredientsSection
        ingredients={item.ingredients || []}
        id={item.id}
        isExpanded={isExpanded}
        onToggle={onToggle}
      />
    </div>
  );
});
