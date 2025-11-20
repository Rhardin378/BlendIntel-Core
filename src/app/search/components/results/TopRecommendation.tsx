import { useSearch } from "@/contexts/SearchContext";
import { CategoryBadge } from "../shared/CategoryBadge";
import { NutritionGrid } from "../shared/NutritionGrid";
import { AllergenBadges } from "../shared/AllergenBadges";
import { IngredientsSection } from "../shared/IngredientsSection";
import { ShareButton } from "../shared/ShareButton";

export function TopRecommendation() {
  const { results, expandedIngredients, toggleIngredients } = useSearch();

  if (!results) return null;

  const item = results.topRecommendation;

  return (
    <>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
        🏆 Top Recommendation
      </p>

      <CategoryBadge category={item.category} size={item.nutritionSize} />

      <h3 className="font-semibold text-lg text-gray-900 mb-3">{item.name}</h3>

      <NutritionGrid
        calories={item.nutrition_calories}
        protein={item.nutrition_protein}
        carbs={item.nutrition_carbs}
        fat={item.nutrition_fat}
      />

      <AllergenBadges allergens={item.allergens || []} />

      <IngredientsSection
        ingredients={item.ingredients || []}
        id={item.id}
        isExpanded={expandedIngredients.has(item.id)}
        onToggle={toggleIngredients}
      />

      <ShareButton itemName={item.name} category={item.category} />
    </>
  );
}
