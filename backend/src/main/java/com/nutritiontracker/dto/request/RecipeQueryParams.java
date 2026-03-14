package com.nutritiontracker.dto.request;

import java.math.BigDecimal;

public record RecipeQueryParams(
    String search,
    String ingredients,       // comma-separated ingredient IDs
    BigDecimal minCalories,
    BigDecimal maxCalories,
    BigDecimal minProtein,
    BigDecimal maxProtein,
    BigDecimal minCarbs,
    BigDecimal maxCarbs,
    BigDecimal minFat,
    BigDecimal maxFat,
    Integer minRating,
    Integer maxRating,
    Boolean isFavorite,
    String sortBy,
    String sortOrder
) {
    public String effectiveSortOrder() {
        return sortOrder != null ? sortOrder : "asc";
    }
}
