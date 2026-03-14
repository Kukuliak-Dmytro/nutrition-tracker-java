package com.nutritiontracker.dto.response;

public record NutritionSummaryResponse(
    String weekStart,
    String weekEnd,
    String dayStart,
    String dayEnd,
    NutritionData totalNutritionPerWeek,
    long totalMeals,
    NutritionData totalNutritionDaily,
    long totalMealsDaily
) {}
