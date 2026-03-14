package com.nutritiontracker.dto.response;

public record CookingStatsResponse(
    long totalCooks,
    long todayCooks,
    long thisWeekCooks,
    int currentStreak,
    MostCookedRecipe mostCookedRecipe,
    double weeklyAverage
) {
    public record MostCookedRecipe(String name, long count) {}
}
