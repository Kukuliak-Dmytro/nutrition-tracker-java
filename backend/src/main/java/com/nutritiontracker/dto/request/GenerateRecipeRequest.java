package com.nutritiontracker.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.List;

public record GenerateRecipeRequest(
    @NotBlank(message = "Recipe name is required")
    String name,

    @Min(value = 1, message = "Servings must be at least 1")
    int servings,

    @NotNull(message = "Ingredients are required")
    @Size(min = 1, message = "At least one ingredient is required")
    @Valid
    List<IngredientInput> ingredients
) {
    public record IngredientInput(
        @NotBlank(message = "Ingredient name is required")
        String name,

        @NotNull(message = "Quantity is required")
        @DecimalMin(value = "1", message = "Quantity must be at least 1g")
        BigDecimal quantityGrams
    ) {}
}
