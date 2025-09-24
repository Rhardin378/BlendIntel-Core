import { z } from "zod";

const NutritionAmountSchema = z.object({
  amount: z.number(),
  unit: z.string(),
});

const SmoothieNutritionSchema = z.object({
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
  caffeine: NutritionAmountSchema.optional(), // caffeine may not be present in all smoothies
});

const SizeInformationSchema = z.record(
  z.string(),
  z.object({
    nutritionInformation: SmoothieNutritionSchema,
  })
);

export const SmoothieSchema = z.object({
  name: z.string(),
  category: z.string(),
  image: z.string().url(),
  ingredients: z.array(z.string()),
  hasAllergens: z.boolean(),
  hasCaffeine: z.boolean().optional(),
  allergens: z.array(z.string()),
  sizeInformation: SizeInformationSchema,
  description: z.string(),
});
