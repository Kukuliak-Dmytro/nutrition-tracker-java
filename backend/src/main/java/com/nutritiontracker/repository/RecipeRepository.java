package com.nutritiontracker.repository;

import com.nutritiontracker.entity.Recipe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RecipeRepository extends JpaRepository<Recipe, UUID>,
                                          JpaSpecificationExecutor<Recipe> {

    @Query("SELECT r FROM Recipe r LEFT JOIN FETCH r.ingredients ri LEFT JOIN FETCH ri.ingredient WHERE r.id = :id")
    Optional<Recipe> findByIdWithIngredients(UUID id);

    @Query("SELECT DISTINCT r FROM Recipe r LEFT JOIN FETCH r.ingredients ri LEFT JOIN FETCH ri.ingredient ORDER BY r.createdAt DESC")
    List<Recipe> findRecentWithIngredients();

    List<Recipe> findTop4ByOrderByCreatedAtDesc();
}
