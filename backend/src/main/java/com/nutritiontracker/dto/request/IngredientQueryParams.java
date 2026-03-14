package com.nutritiontracker.dto.request;

import java.math.BigDecimal;

public record IngredientQueryParams(
    String cursor,
    Integer limit,
    String search,
    BigDecimal minCalories,
    BigDecimal maxCalories,
    BigDecimal minProtein,
    BigDecimal maxProtein,
    BigDecimal minCarbs,
    BigDecimal maxCarbs,
    BigDecimal minFat,
    BigDecimal maxFat,
    String sortBy,
    String sortOrder
) {
    public int effectiveLimit() {
        return limit != null && limit > 0 ? Math.min(limit, 10000) : 20;
    }

    public String effectiveSortBy() {
        return sortBy != null ? sortBy : "name";
    }

    public String effectiveSortOrder() {
        return sortOrder != null ? sortOrder : "asc";
    }
}
