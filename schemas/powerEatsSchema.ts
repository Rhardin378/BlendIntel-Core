import { z } from "zod";

const NutritionAmountSchema = z.object({
  amount: z.number(),
  unit: z.string(),
});

const PowerEatsNutritionSchema = z.object({
  calories: z.number(),
  fat: NutritionAmountSchema,
  carbs: NutritionAmountSchema,
  protein: NutritionAmountSchema,
  saturated_fat: NutritionAmountSchema,
  trans_fat: NutritionAmountSchema,
  cholesterol: NutritionAmountSchema,
  fiber: NutritionAmountSchema,
  sugar: NutritionAmountSchema,
  added_sugar: NutritionAmountSchema,
  sodium: NutritionAmountSchema,
  "vitamin D": NutritionAmountSchema,
  calcium: NutritionAmountSchema,
  iron: NutritionAmountSchema,
  potassium: NutritionAmountSchema,
});

export const PowerEatsSchema = z.object({
  name: z.string(),
  category: z.string(),
  image: z.string().url(),
  ingredients: z.array(z.string()),
  nutritionInformation: PowerEatsNutritionSchema,
  allergens: z.array(z.string()),
  hasAllergens: z.boolean(),
  servingSize: z.string(),
  description: z.string(),
});
