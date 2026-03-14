package com.nutritiontracker.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record IngredientResponse(
    UUID id,
    String name,
    BigDecimal caloriesPer100g,
    BigDecimal proteinPer100g,
    BigDecimal carbsPer100g,
    BigDecimal fatPer100g,
    String category,
    boolean isCustom,
    LocalDateTime createdAt
) {}
