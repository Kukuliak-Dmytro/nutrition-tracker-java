package com.nutritiontracker.service;

import com.nutritiontracker.dto.response.NutritionData;
import com.nutritiontracker.entity.Recipe;
import com.nutritiontracker.entity.RecipeIngredient;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
public class NutritionCalculationService {

    public NutritionData calculateIngredientNutrition(BigDecimal caloriesPer100g,
                                                       BigDecimal proteinPer100g,
                                                       BigDecimal carbsPer100g,
                                                       BigDecimal fatPer100g,
                                                       BigDecimal quantityGrams) {
        double quantity = quantityGrams.doubleValue();
        return new NutritionData(
            round1(caloriesPer100g.doubleValue() * quantity / 100.0),
            round1(proteinPer100g.doubleValue() * quantity / 100.0),
            round1(carbsPer100g.doubleValue() * quantity / 100.0),
            round1(fatPer100g.doubleValue() * quantity / 100.0)
        );
    }

    public NutritionData calculateRecipeNutrition(Recipe recipe) {
        if (recipe.getIngredients() == null || recipe.getIngredients().isEmpty()) {
            return NutritionData.zero();
        }
        return recipe.getIngredients().stream()
            .map(ri -> calculateIngredientNutrition(
                ri.getIngredient().getCaloriesPer100g(),
                ri.getIngredient().getProteinPer100g(),
                ri.getIngredient().getCarbsPer100g(),
                ri.getIngredient().getFatPer100g(),
                ri.getQuantityGrams()
            ))
            .reduce(NutritionData.zero(), NutritionData::add);
    }

    public NutritionData calculateRecipeNutritionFromIngredients(List<RecipeIngredient> ingredients) {
        if (ingredients == null || ingredients.isEmpty()) {
            return NutritionData.zero();
        }
        return ingredients.stream()
            .map(ri -> calculateIngredientNutrition(
                ri.getIngredient().getCaloriesPer100g(),
                ri.getIngredient().getProteinPer100g(),
                ri.getIngredient().getCarbsPer100g(),
                ri.getIngredient().getFatPer100g(),
                ri.getQuantityGrams()
            ))
            .reduce(NutritionData.zero(), NutritionData::add);
    }

    private double round1(double value) {
        return Math.round(value * 10.0) / 10.0;
    }
}
