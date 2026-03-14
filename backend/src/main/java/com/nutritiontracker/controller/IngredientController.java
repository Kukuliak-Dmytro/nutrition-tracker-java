package com.nutritiontracker.controller;

import com.nutritiontracker.dto.request.CreateIngredientRequest;
import com.nutritiontracker.dto.request.IngredientQueryParams;
import com.nutritiontracker.dto.request.UpdateIngredientRequest;
import com.nutritiontracker.dto.response.IngredientResponse;
import com.nutritiontracker.dto.response.PaginatedResponse;
import com.nutritiontracker.service.IngredientService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.UUID;

@RestController
@RequestMapping("/api/ingredients")
public class IngredientController {

    private final IngredientService service;

    public IngredientController(IngredientService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<PaginatedResponse<IngredientResponse>> getIngredients(
            @RequestParam(required = false) String cursor,
            @RequestParam(required = false) Integer limit,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) BigDecimal minCalories,
            @RequestParam(required = false) BigDecimal maxCalories,
            @RequestParam(required = false) BigDecimal minProtein,
            @RequestParam(required = false) BigDecimal maxProtein,
            @RequestParam(required = false) BigDecimal minCarbs,
            @RequestParam(required = false) BigDecimal maxCarbs,
            @RequestParam(required = false) BigDecimal minFat,
            @RequestParam(required = false) BigDecimal maxFat,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String sortOrder) {

        IngredientQueryParams params = new IngredientQueryParams(
            cursor, limit, search,
            minCalories, maxCalories, minProtein, maxProtein,
            minCarbs, maxCarbs, minFat, maxFat,
            sortBy, sortOrder
        );
        return ResponseEntity.ok(service.getIngredients(params));
    }

    @PostMapping
    public ResponseEntity<IngredientResponse> createIngredient(
            @Valid @RequestBody CreateIngredientRequest request) {
        return ResponseEntity.ok(service.createIngredient(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<IngredientResponse> getIngredient(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getIngredient(id));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<IngredientResponse> updateIngredient(
            @PathVariable UUID id,
            @RequestBody UpdateIngredientRequest request) {
        return ResponseEntity.ok(service.updateIngredient(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<IngredientResponse> deleteIngredient(@PathVariable UUID id) {
        return ResponseEntity.ok(service.deleteIngredient(id));
    }
}
