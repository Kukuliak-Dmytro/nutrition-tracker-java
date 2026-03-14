import { http, getErrorMessage } from "@/lib/http";
import {
   CookingHistoryQuery,
   CookingHistoryQuerySchema,
   CookingHistoryResponseSchema,
   PaginatedCookingHistoryResponse,
   PaginatedCookingHistoryResponseSchema,
   CookingHistoryResponse,
   CreateCookingHistorySchema,
   CookingHistoryStats,
   CookingHistoryStatsSchema,
   WeeklyNutrition,
   WeeklyNutritionSchema,
} from "../../../utils/schemas";
import { ZodError } from "zod";

export const getCookingHistory = async (
   params: Partial<CookingHistoryQuery> = {}
): Promise<PaginatedCookingHistoryResponse> => {
   try {
      const validatedParams = CookingHistoryQuerySchema.partial().parse(params);
      const queryParams = new URLSearchParams();

      Object.entries(validatedParams).forEach(([key, value]) => {
         if (value !== undefined && value !== null && value !== "") {
            if (value instanceof Date) {
               queryParams.append(key, value.toISOString());
            } else {
               queryParams.append(key, value.toString());
            }
         }
      });
      const response = await http.get(
         `/cooking-history?${queryParams.toString()}`
      );
      return PaginatedCookingHistoryResponseSchema.parse(response.data);
   } catch (error) {
      if (error instanceof ZodError) {
         throw new Error("Invalid cooking history query: " + error.message);
      }
      throw new Error(getErrorMessage(error));
   }
};

export const getCookingStats = async (): Promise<CookingHistoryStats> => {
   try {
      const response = await http.get("/cooking-history/stats");
      return CookingHistoryStatsSchema.parse(response.data);
   } catch (error) {
      if (error instanceof ZodError) {
         throw new Error("Invalid cooking stats: " + error.message);
      }
      throw new Error(getErrorMessage(error));
   }
};

export const getWeeklyNutrition = async (): Promise<WeeklyNutrition> => {
   try {
      const response = await http.get("/cooking-history/nutrition");
      return WeeklyNutritionSchema.parse(response.data);
   } catch (error) {
      if (error instanceof ZodError) {
         throw new Error("Invalid weekly nutrition data: " + error.message);
      }
      throw new Error(getErrorMessage(error));
   }
};

export const createCookingHistory = async (
   cookingHistory: CreateCookingHistorySchema
): Promise<CookingHistoryResponse> => {
   try {
      const response = await http.post("/cooking-history", cookingHistory);
      return CookingHistoryResponseSchema.parse(response.data);
   } catch (error) {
      if (error instanceof ZodError) {
         throw new Error("Invalid cooking history data: " + error.message);
      }
      throw new Error(getErrorMessage(error));
   }
};

export const deleteCookingHistory = async (id: string): Promise<void> => {
   try {
      await http.delete(`/cooking-history/${id}`);
      return;
   } catch (error) {
      if (error instanceof ZodError) {
         throw new Error("Invalid cooking history data: " + error.message);
      }
      throw new Error(getErrorMessage(error));
   }
};
