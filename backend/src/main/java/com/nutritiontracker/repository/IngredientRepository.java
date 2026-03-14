package com.nutritiontracker.repository;

import com.nutritiontracker.entity.Ingredient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface IngredientRepository extends JpaRepository<Ingredient, UUID>,
                                              JpaSpecificationExecutor<Ingredient> {

    Optional<Ingredient> findByName(String name);

    long countByNameContainingIgnoreCase(String name);
}
