package com.nutritiontracker.dto.response;

import java.util.List;

public record DashboardResponse(
    long totalRecipes,
    List<RecipeResponse> recentRecipes,
    CookingStatsResponse cookingStats,
    List<CookingHistoryResponse> recentCookingHistory,
    NutritionSummaryResponse weeklyNutrition
) {}
