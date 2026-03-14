package com.nutritiontracker.dto.response;

import java.math.BigDecimal;
import java.util.UUID;

public record RecipeIngredientResponse(
    UUID id,
    UUID recipeId,
    UUID ingredientId,
    BigDecimal quantityGrams,
    IngredientResponse ingredient
) {}
