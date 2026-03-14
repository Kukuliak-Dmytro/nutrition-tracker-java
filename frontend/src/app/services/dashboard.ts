import { http, getErrorMessage } from "@/lib/http";
import { ZodError } from "zod";
import { z } from "zod";

// Dashboard response schema
export const DashboardResponseSchema = z.object({
  totalRecipes: z.number(),
  recentRecipes: z.array(z.any()), // Recipe schema is complex, using any for now
  cookingStats: z.object({
    totalCooks: z.number(),
    todayCooks: z.number(),
    thisWeekCooks: z.number(),
    currentStreak: z.number(),
    mostCookedRecipe: z.object({
      name: z.string(),
      count: z.number(),
    }).nullish(),
    weeklyAverage: z.number(),
  }),
  recentCookingHistory: z.array(z.any()), // CookingHistoryResponse schema
  weeklyNutrition: z.object({
    weekStart: z.string(),
    weekEnd: z.string(),
    dayStart: z.string(),
    dayEnd: z.string(),
    totalNutritionPerWeek: z.object({
      calories: z.number(),
      protein: z.number(),
      carbs: z.number(),
      fat: z.number(),
    }),
    totalMeals: z.number(),
    totalNutritionDaily: z.object({
      calories: z.number(),
      protein: z.number(),
      carbs: z.number(),
      fat: z.number(),
    }),
    totalMealsDaily: z.number(),
  }),
});

export type DashboardResponse = z.infer<typeof DashboardResponseSchema>;

export const getDashboardData = async (): Promise<DashboardResponse> => {
  try {
    const response = await http.get("/dashboard");
    return DashboardResponseSchema.parse(response.data);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new Error("Invalid dashboard data: " + error.message);
    }
    throw new Error(getErrorMessage(error));
  }
};

