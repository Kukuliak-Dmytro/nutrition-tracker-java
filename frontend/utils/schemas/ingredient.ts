import { z } from "zod";

export const GetIngredientSchema = z.object({
  id: z.string(),
});

export const IngredientSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, "Name is required"),
  caloriesPer100g: z.coerce
    .number()
    .min(0)
    .max(10000, "Calories must be between 0-10000"),
  proteinPer100g: z.coerce
    .number()
    .min(0)
    .max(100, "Protein must be between 0-100g"),
  carbsPer100g: z.coerce
    .number()
    .min(0)
    .max(100, "Carbs must be between 0-100g"),
  fatPer100g: z.coerce.number().min(0).max(100, "Fat must be between 0-100g"),
  category: z.string().optional(),
});

export const CreateIngredientSchema = IngredientSchema;

export const UpdateIngredientSchema = IngredientSchema.partial();

export const IngredientResponseSchema = IngredientSchema.extend({
  id: z.string().optional(),
  isCustom: z.boolean(),
  createdAt: z.string().transform((str) => new Date(str).toISOString()),
});

export const IngredientResponseArraySchema = z.array(IngredientResponseSchema);

export const PaginatedIngredientsResponseSchema = z.object({
  data: z.array(IngredientResponseSchema),
  nextCursor: z.string().nullable(),
  hasMore: z.boolean(),
  totalIngredients: z.number(),
});

export const IngredientQuerySchema = z
  .object({
    cursor: z.string().optional(),
    limit: z.coerce.number().min(1).max(10000).optional(),
    search: z.string().optional(),
    minCalories: z.coerce.number().min(0).max(10000).optional(),
    maxCalories: z.coerce.number().min(0).max(10000).optional(),
    minProtein: z.coerce.number().min(0).max(100).optional(),
    maxProtein: z.coerce.number().min(0).max(100).optional(),
    minCarbs: z.coerce.number().min(0).max(100).optional(),
    maxCarbs: z.coerce.number().min(0).max(100).optional(),
    minFat: z.coerce.number().min(0).max(100).optional(),
    maxFat: z.coerce.number().min(0).max(100).optional(),
    sortBy: z
      .enum([
        "name",
        "caloriesPer100g",
        "proteinPer100g",
        "carbsPer100g",
        "fatPer100g",
        "category",
        "createdAt",
      ])
      .optional(),
    sortOrder: z.enum(["asc", "desc"]).optional().default("asc"),
  })
  .refine(
    (data) => {
      if (data.minCalories && data.maxCalories)
        return data.minCalories <= data.maxCalories;
      if (data.minProtein && data.maxProtein)
        return data.minProtein <= data.maxProtein;
      if (data.minCarbs && data.maxCarbs) return data.minCarbs <= data.maxCarbs;
      if (data.minFat && data.maxFat) return data.minFat <= data.maxFat;
      return true;
    },
    {
      message: "Minimum values must be less than or equal to maximum values",
      path: [
        "minCalories",
        "maxCalories",
        "minProtein",
        "maxProtein",
        "minCarbs",
        "maxCarbs",
        "minFat",
        "maxFat",
      ],
    }
  );

export type Ingredient = z.infer<typeof IngredientSchema>;
export type CreateIngredient = z.infer<typeof CreateIngredientSchema>;
export type UpdateIngredient = z.infer<typeof UpdateIngredientSchema>;
export type IngredientResponse = z.infer<typeof IngredientResponseSchema>;
export type PaginatedIngredientsResponse = z.infer<
  typeof PaginatedIngredientsResponseSchema
>;
export type IngredientQuery = z.infer<typeof IngredientQuerySchema>;
