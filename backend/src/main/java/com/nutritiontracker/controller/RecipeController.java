package com.nutritiontracker.controller;

import com.nutritiontracker.dto.request.CreateRecipeRequest;
import com.nutritiontracker.dto.request.RecipeQueryParams;
import com.nutritiontracker.dto.request.UpdateRecipeRequest;
import com.nutritiontracker.dto.response.RecipeListResponse;
import com.nutritiontracker.dto.response.RecipeResponse;
import com.nutritiontracker.service.RecipeService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.UUID;

@RestController
@RequestMapping("/api/recipes")
public class RecipeController {

    private final RecipeService service;

    public RecipeController(RecipeService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<RecipeListResponse> getRecipes(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String ingredients,
            @RequestParam(required = false) BigDecimal minCalories,
            @RequestParam(required = false) BigDecimal maxCalories,
            @RequestParam(required = false) BigDecimal minProtein,
            @RequestParam(required = false) BigDecimal maxProtein,
            @RequestParam(required = false) BigDecimal minCarbs,
            @RequestParam(required = false) BigDecimal maxCarbs,
            @RequestParam(required = false) BigDecimal minFat,
            @RequestParam(required = false) BigDecimal maxFat,
            @RequestParam(required = false) Integer minRating,
            @RequestParam(required = false) Integer maxRating,
            @RequestParam(required = false) Boolean isFavorite,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String sortOrder) {

        RecipeQueryParams params = new RecipeQueryParams(
            search, ingredients,
            minCalories, maxCalories, minProtein, maxProtein,
            minCarbs, maxCarbs, minFat, maxFat,
            minRating, maxRating, isFavorite,
            sortBy, sortOrder
        );
        return ResponseEntity.ok(service.getRecipes(params));
    }

    @PostMapping
    public ResponseEntity<RecipeResponse> createRecipe(
            @Valid @RequestBody CreateRecipeRequest request) {
        return ResponseEntity.ok(service.createRecipe(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<RecipeResponse> getRecipe(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getRecipe(id));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<RecipeResponse> updateRecipe(
            @PathVariable UUID id,
            @RequestBody UpdateRecipeRequest request) {
        return ResponseEntity.ok(service.updateRecipe(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<RecipeResponse> deleteRecipe(@PathVariable UUID id) {
        return ResponseEntity.ok(service.deleteRecipe(id));
    }
}
