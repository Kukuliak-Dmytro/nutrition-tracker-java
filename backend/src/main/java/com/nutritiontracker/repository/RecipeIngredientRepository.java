package com.nutritiontracker.repository;

import com.nutritiontracker.entity.RecipeIngredient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface RecipeIngredientRepository extends JpaRepository<RecipeIngredient, UUID> {

    void deleteAllByRecipeId(UUID recipeId);
}
