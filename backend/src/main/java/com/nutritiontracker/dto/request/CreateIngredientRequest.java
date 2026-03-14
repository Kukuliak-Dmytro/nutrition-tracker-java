package com.nutritiontracker.dto.request;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record CreateIngredientRequest(
    @NotBlank(message = "Name is required")
    @Size(min = 3, message = "Name must be at least 3 characters")
    String name,

    @NotNull(message = "Calories is required")
    @DecimalMin(value = "0", message = "Calories must be >= 0")
    @DecimalMax(value = "10000", message = "Calories must be <= 10000")
    BigDecimal caloriesPer100g,

    @NotNull(message = "Protein is required")
    @DecimalMin(value = "0", message = "Protein must be >= 0")
    @DecimalMax(value = "100", message = "Protein must be <= 100")
    BigDecimal proteinPer100g,

    @NotNull(message = "Carbs is required")
    @DecimalMin(value = "0", message = "Carbs must be >= 0")
    @DecimalMax(value = "100", message = "Carbs must be <= 100")
    BigDecimal carbsPer100g,

    @NotNull(message = "Fat is required")
    @DecimalMin(value = "0", message = "Fat must be >= 0")
    @DecimalMax(value = "100", message = "Fat must be <= 100")
    BigDecimal fatPer100g,

    String category
) {}
