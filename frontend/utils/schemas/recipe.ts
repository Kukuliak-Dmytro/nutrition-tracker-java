import { z } from "zod";

export const GetRecipeSchema = z.object({
  id: z.string(),
});

export const GenerateRecipeSchema = z.object({
  name: z.string(),
  servings: z.coerce.number().int().min(1, "Servings must be at least 1"),
  ingredients: z.array(z.object({
    name: z.string(),
    quantityGrams: z.coerce.number().int().min(1, "Quantity must be at least 1g"),
  })).min(1, "At least one ingredient is required"),
})

export const GenerateRecipeResponseSchema = z.object({
  description: z.string().min(1, "Description is required"),
  instructions: z.string().min(1, "Instructions are required"),
}).strict();

export const RecipeSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().nullable().optional(),
  instructions: z.string().nullable().optional(),
  servings: z.coerce.number().int().min(1, "Servings must be at least 1"),
  cookingTime: z.string().nullable().optional(),
  rating: z.coerce
    .number()
    .int()
    .min(1)
    .max(100, "Rating must be between 1-100")
    .nullable()
    .optional(),
  isFavorite: z.boolean().optional(),
});

export const RecipeIngredientInputSchema = z.object({
  ingredientId: z.string().min(1, "Ingredient is required"),
  quantityGrams: z.coerce
    .number()
    .positive("Quantity must be positive")
    .max(1000, "Quantity must be less than 1000g"),
});

export const CreateRecipeSchema = RecipeSchema.extend({
  ingredients: z
    .array(RecipeIngredientInputSchema)
    .min(1, "Recipe must have at least one ingredient"),
});

export const UpdateRecipeSchema = RecipeSchema.partial().extend({
  ingredients: z.array(RecipeIngredientInputSchema).optional(),
});

export const RecipeIngredientResponseSchema = z.object({
  id: z.string(),
  recipeId: z.string(),
  ingredientId: z.string(),
  quantityGrams: z.coerce.number(),
  ingredient: z.object({
    id: z.string(),
    name: z.string(),
    caloriesPer100g: z.coerce.number(),
    proteinPer100g: z.coerce.number(),
    carbsPer100g: z.coerce.number(),
    fatPer100g: z.coerce.number(),
    category: z.string().nullable(),
    isCustom: z.boolean().optional(),
    createdAt: z.string().optional(),
  }),
});

export const RecipeResponseSchema = RecipeSchema.extend({
  id: z.string(),
  createdAt: z.string().transform((str) => new Date(str)),
  updatedAt: z.string().transform((str) => new Date(str)),
  ingredients: z.array(RecipeIngredientResponseSchema).optional(),
});

export const RecipeQuerySchema = z.object({
  search: z.string().optional(),
  ingredients: z.string().optional(),
  minCalories: z.coerce.number().min(1).max(3000).optional(),
  maxCalories: z.coerce.number().min(1).max(3000).optional(),
  minProtein: z.coerce.number().min(1).max(200).optional(),
  maxProtein: z.coerce.number().min(1).max(200).optional(),
  minCarbs: z.coerce.number().min(1).max(300).optional(),
  maxCarbs: z.coerce.number().min(1).max(300).optional(),
  minFat: z.coerce.number().min(1).max(150).optional(),
  maxFat: z.coerce.number().min(1).max(150).optional(),
  minRating: z.coerce.number().min(1).max(100).optional(),
  maxRating: z.coerce.number().min(1).max(100).optional(),
  isFavorite: z.coerce.boolean().optional(),
  sortBy: z
    .enum(["name", "rating", "calories", "protein", "carbs", "fat", "createdAt", "updatedAt", "servings"])
    .optional(),
  sortOrder: z.enum(["asc", "desc"]).optional().default("asc"),
});


export type RecipeResponse = z.infer<typeof RecipeResponseSchema>;
export type CreateRecipe = z.infer<typeof CreateRecipeSchema>;
export type RecipeQuery = z.infer<typeof RecipeQuerySchema>;
export type UpdateRecipe = z.infer<typeof UpdateRecipeSchema>;
export type GenerateRecipe = z.infer<typeof GenerateRecipeSchema>;
export type GenerateRecipeResponse = z.infer<typeof GenerateRecipeResponseSchema>;