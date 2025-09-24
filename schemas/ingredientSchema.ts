import { z } from "zod";

export const NutritionAmountSchema = z.object({
  amount: z.number(),
  unit: z.string(),
});

export const NutritionSchema = z.object({
  calories: z.number(),
  fat: NutritionAmountSchema,
  carbs: NutritionAmountSchema,
  protein: NutritionAmountSchema,
  saturated_fat: NutritionAmountSchema,
  cholesterol: NutritionAmountSchema,
  fiber: NutritionAmountSchema,
  sugar: NutritionAmountSchema,
  added_sugar: NutritionAmountSchema,
  sodium: NutritionAmountSchema,
});

export const IngredientSchema = z.object({
  name: z.string(),
  image: z.string().url(),
  nutrition: NutritionSchema,
  allergens: z.array(z.string()),
  hasAllergens: z.boolean(),
  servingSize: z.string(),
});
