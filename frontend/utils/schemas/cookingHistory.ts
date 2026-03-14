import z from "zod";
import { RecipeResponseSchema } from "./recipe";

export const CreateCookingHistorySchema = z
   .object({
      recipeId: z.string(),
      cookedAt: z.coerce.date(),
      createdAt: z.coerce.date().optional(),
   })
   .refine(
      (data) => {
         return data.cookedAt <= new Date();
      },
      {
         message: "Cooked at must be in the past",
         path: ["cookedAt"],
      }
   );

export const CookingHistorySchema = z.object({
   id: z.string(),
   recipeId: z.string(),
   cookedAt: z.string().transform((str) => new Date(str)),
   createdAt: z.string().transform((str) => new Date(str)).optional(),
});

export const CookingHistoryResponseSchema = CookingHistorySchema.extend({
   recipe: RecipeResponseSchema.extend({
      ingredients: z.array(z.object({
         id: z.string(),
         recipeId: z.string(),
         ingredientId: z.string(),
         quantityGrams: z.number().or(z.any()),
         ingredient: z.object({
            id: z.string(),
            name: z.string(),
            caloriesPer100g: z.number().or(z.any()),
            proteinPer100g: z.number().or(z.any()),
            carbsPer100g: z.number().or(z.any()),
            fatPer100g: z.number().or(z.any()),
         })
      })),
      timesCooked: z.number().optional(),
   }),
});

export const CookingHistoryQuerySchema = z
   .object({
      cursor: z.string().optional(),
      limit: z.coerce.number().min(1).max(10000).optional(),
      search: z.string().optional(),
      startDate: z.coerce.date().optional(),
      endDate: z.coerce.date().optional(),
      timesCooked: z.number().optional(),
      sortBy: z.enum(["cookedAt", "recipeName", "rating"]).optional(),
      sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
   })
   .refine(
      (data) => {
         if (data.startDate && data.endDate) {
            return data.startDate <= data.endDate;
         }
         return true;
      },
      {
         message: "Start date must be before end date",
         path: ["startDate", "endDate"],
      }
   );

export const PaginatedCookingHistoryResponseSchema = z.object({
   data: z.array(CookingHistoryResponseSchema),
   nextCursor: z.string().nullable(),
   hasMore: z.boolean(),
   totalCooks: z.number(),
   recentCookingHistory: z.array(CookingHistoryResponseSchema)
});

export const CookingHistoryStatsSchema = z.object({
   totalCooks: z.number(),
   thisWeekCooks: z.number(),
   todayCooks: z.number(),
   currentStreak: z.number(),
   mostCookedRecipe: z
      .object({
         name: z.string(),
         count: z.number(),
      })
      .nullable(),
   weeklyAverage: z.number(),
});

export const WeeklyNutritionSchema = z.object({
   weekStart: z.string().transform((str) => new Date(str)),
   weekEnd: z.string().transform((str) => new Date(str)),
   totalNutritionPerWeek: z.object({
     calories: z.number(),
     protein: z.number(),
     carbs: z.number(),
     fat: z.number(),
   }),
   totalMeals: z.number(),
})

export type CookingHistory = z.infer<typeof CookingHistorySchema>;
export type CookingHistoryResponse = z.infer<
   typeof CookingHistoryResponseSchema
>;
export type CookingHistoryQuery = z.infer<typeof CookingHistoryQuerySchema>;
export type PaginatedCookingHistoryResponse = z.infer<
   typeof PaginatedCookingHistoryResponseSchema
>;
export type CookingHistoryStats = z.infer<typeof CookingHistoryStatsSchema>;
export type CreateCookingHistorySchema = z.infer<typeof CreateCookingHistorySchema>;
export type WeeklyNutrition = z.infer<typeof WeeklyNutritionSchema>;