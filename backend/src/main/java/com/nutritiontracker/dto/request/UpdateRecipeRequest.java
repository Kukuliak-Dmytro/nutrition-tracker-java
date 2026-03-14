package com.nutritiontracker.dto.request;

import java.math.BigDecimal;
import java.util.List;

public record UpdateRecipeRequest(
    String name,
    String description,
    String instructions,
    Integer servings,
    String cookingTime,
    Short rating,
    Boolean isFavorite,
    List<RecipeIngredientInput> ingredients
) {
    public record RecipeIngredientInput(
        String ingredientId,
        BigDecimal quantityGrams
    ) {}
}
