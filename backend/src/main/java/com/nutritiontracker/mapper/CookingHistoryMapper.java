package com.nutritiontracker.mapper;

import com.nutritiontracker.dto.response.CookingHistoryResponse;
import com.nutritiontracker.dto.response.RecipeResponse;
import com.nutritiontracker.entity.CookingHistory;

public final class CookingHistoryMapper {

    private CookingHistoryMapper() {}

    public static CookingHistoryResponse toResponse(CookingHistory entity) {
        RecipeResponse recipeResponse = RecipeMapper.toResponse(entity.getRecipe());
        return new CookingHistoryResponse(
            entity.getId(),
            entity.getRecipe().getId(),
            entity.getCookedAt(),
            entity.getCreatedAt(),
            recipeResponse
        );
    }

    public static CookingHistoryResponse toResponseWithTimesCooked(CookingHistory entity, int timesCooked) {
        RecipeResponse recipeResponse = RecipeMapper.toResponseWithTimesCooked(entity.getRecipe(), timesCooked);
        return new CookingHistoryResponse(
            entity.getId(),
            entity.getRecipe().getId(),
            entity.getCookedAt(),
            entity.getCreatedAt(),
            recipeResponse
        );
    }
}
