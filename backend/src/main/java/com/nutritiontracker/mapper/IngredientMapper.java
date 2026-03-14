package com.nutritiontracker.mapper;

import com.nutritiontracker.dto.request.CreateIngredientRequest;
import com.nutritiontracker.dto.request.UpdateIngredientRequest;
import com.nutritiontracker.dto.response.IngredientResponse;
import com.nutritiontracker.entity.Ingredient;

public final class IngredientMapper {

    private IngredientMapper() {}

    public static IngredientResponse toResponse(Ingredient entity) {
        return new IngredientResponse(
            entity.getId(),
            entity.getName(),
            entity.getCaloriesPer100g(),
            entity.getProteinPer100g(),
            entity.getCarbsPer100g(),
            entity.getFatPer100g(),
            entity.getCategory(),
            entity.isCustom(),
            entity.getCreatedAt()
        );
    }

    public static Ingredient toEntity(CreateIngredientRequest request) {
        Ingredient ingredient = new Ingredient();
        ingredient.setName(request.name());
        ingredient.setCaloriesPer100g(request.caloriesPer100g());
        ingredient.setProteinPer100g(request.proteinPer100g());
        ingredient.setCarbsPer100g(request.carbsPer100g());
        ingredient.setFatPer100g(request.fatPer100g());
        ingredient.setCategory(request.category());
        ingredient.setCustom(true);
        return ingredient;
    }

    public static void updateEntity(Ingredient entity, UpdateIngredientRequest request) {
        if (request.name() != null) entity.setName(request.name());
        if (request.caloriesPer100g() != null) entity.setCaloriesPer100g(request.caloriesPer100g());
        if (request.proteinPer100g() != null) entity.setProteinPer100g(request.proteinPer100g());
        if (request.carbsPer100g() != null) entity.setCarbsPer100g(request.carbsPer100g());
        if (request.fatPer100g() != null) entity.setFatPer100g(request.fatPer100g());
        if (request.category() != null) entity.setCategory(request.category());
    }
}
