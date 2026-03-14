package com.nutritiontracker.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.List;

public record CreateRecipeRequest(
    @NotBlank(message = "Name is required")
    @Size(min = 3, message = "Name must be at least 3 characters")
    String name,

    String description,
    String instructions,

    @Min(value = 1, message = "Servings must be at least 1")
    int servings,

    String cookingTime,

    @Min(value = 1, message = "Rating must be between 1 and 100")
    @Max(value = 100, message = "Rating must be between 1 and 100")
    Short rating,

    Boolean isFavorite,

    @NotNull(message = "Ingredients are required")
    @Size(min = 1, message = "Recipe must have at least one ingredient")
    @Valid
    List<RecipeIngredientInput> ingredients
) {
    public record RecipeIngredientInput(
        @NotBlank(message = "Ingredient ID is required")
        String ingredientId,

        @NotNull(message = "Quantity is required")
        @DecimalMin(value = "0.01", message = "Quantity must be positive")
        @DecimalMax(value = "1000", message = "Quantity must be less than 1000g")
        BigDecimal quantityGrams
    ) {}
}
