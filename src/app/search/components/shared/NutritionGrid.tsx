import { memo } from "react";
interface NutritionGridProps {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export const NutritionGrid = memo(function NutritionGrid({
  calories,
  protein,
  carbs,
  fat,
}: NutritionGridProps) {
  return (
    <div className="grid grid-cols-4 gap-3 mb-4">
      <div className="text-center">
        <p className="text-xs text-gray-600 mb-1">Calories</p>
        <p className="text-lg font-bold text-gray-900">{calories}</p>
      </div>
      <div className="text-center">
        <p className="text-xs text-gray-600 mb-1">Protein</p>
        <p className="text-lg font-bold text-blue-600">{protein}g</p>
      </div>
      <div className="text-center">
        <p className="text-xs text-gray-600 mb-1">Carbs</p>
        <p className="text-lg font-bold text-green-600">{carbs}g</p>
      </div>
      <div className="text-center">
        <p className="text-xs text-gray-600 mb-1">Fat</p>
        <p className="text-lg font-bold text-yellow-600">{fat}g</p>
      </div>
    </div>
  );
});
