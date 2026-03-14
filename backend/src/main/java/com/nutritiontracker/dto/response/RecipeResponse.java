package com.nutritiontracker.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record RecipeResponse(
    UUID id,
    String name,
    String description,
    String instructions,
    int servings,
    String cookingTime,
    Short rating,
    boolean isFavorite,
    LocalDateTime createdAt,
    LocalDateTime updatedAt,
    List<RecipeIngredientResponse> ingredients,
    Integer timesCooked
) {
    // Constructor without timesCooked
    public RecipeResponse(UUID id, String name, String description, String instructions,
                         int servings, String cookingTime, Short rating, boolean isFavorite,
                         LocalDateTime createdAt, LocalDateTime updatedAt,
                         List<RecipeIngredientResponse> ingredients) {
        this(id, name, description, instructions, servings, cookingTime, rating,
             isFavorite, createdAt, updatedAt, ingredients, null);
    }

    public RecipeResponse withTimesCooked(int timesCooked) {
        return new RecipeResponse(id, name, description, instructions, servings, cookingTime,
                                 rating, isFavorite, createdAt, updatedAt, ingredients, timesCooked);
    }
}
