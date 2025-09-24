import { z } from "zod";

const NutritionAmountSchema = z.object({
  amount: z.number(),
  unit: z.string(),
});

const NutritionSchema = z.object({
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

const SizeInformationSchema = z.object({
  bowl: z.object({
    nutritionInformation: NutritionSchema,
  }),
});

export const SmoothieBowlSchema = z.object({
  name: z.string(),
  category: z.string(),
  image: z.string().url(),
  description: z.string(),
  hasAllergens: z.boolean(),
  allergens: z.array(z.string()),
  ingredients: z.array(z.string()),
  sizeInformation: SizeInformationSchema,
});
