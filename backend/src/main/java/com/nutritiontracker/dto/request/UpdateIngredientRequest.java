package com.nutritiontracker.dto.request;

import java.math.BigDecimal;

public record UpdateIngredientRequest(
    String name,
    BigDecimal caloriesPer100g,
    BigDecimal proteinPer100g,
    BigDecimal carbsPer100g,
    BigDecimal fatPer100g,
    String category
) {}
