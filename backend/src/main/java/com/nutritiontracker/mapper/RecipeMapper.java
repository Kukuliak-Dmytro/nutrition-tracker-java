package com.nutritiontracker.mapper;

import com.nutritiontracker.dto.response.IngredientResponse;
import com.nutritiontracker.dto.response.RecipeIngredientResponse;
import com.nutritiontracker.dto.response.RecipeResponse;
import com.nutritiontracker.entity.Recipe;
import com.nutritiontracker.entity.RecipeIngredient;

import java.util.List;

public final class RecipeMapper {

    private RecipeMapper() {}

    public static RecipeResponse toResponse(Recipe entity) {
        List<RecipeIngredientResponse> ingredientResponses = entity.getIngredients() != null
            ? entity.getIngredients().stream()
                .map(RecipeMapper::toRecipeIngredientResponse)
                .toList()
            : List.of();

        return new RecipeResponse(
            entity.getId(),
            entity.getName(),
            entity.getDescription(),
            entity.getInstructions(),
            entity.getServings(),
            entity.getCookingTime(),
            entity.getRating(),
            entity.isFavorite(),
            entity.getCreatedAt(),
            entity.getUpdatedAt(),
            ingredientResponses
        );
    }

    public static RecipeResponse toResponseWithTimesCooked(Recipe entity, int timesCooked) {
        return toResponse(entity).withTimesCooked(timesCooked);
    }

    private static RecipeIngredientResponse toRecipeIngredientResponse(RecipeIngredient ri) {
        IngredientResponse ingredientResponse = IngredientMapper.toResponse(ri.getIngredient());
        return new RecipeIngredientResponse(
            ri.getId(),
            ri.getRecipe().getId(),
            ri.getIngredient().getId(),
            ri.getQuantityGrams(),
            ingredientResponse
        );
    }
}
