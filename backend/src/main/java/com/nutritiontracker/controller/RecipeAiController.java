package com.nutritiontracker.controller;

import com.nutritiontracker.dto.request.GenerateRecipeRequest;
import com.nutritiontracker.dto.response.GenerateRecipeResponse;
import com.nutritiontracker.service.RecipeAiService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai/generate-recipe")
public class RecipeAiController {

    private final RecipeAiService service;

    public RecipeAiController(RecipeAiService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<GenerateRecipeResponse> generateRecipe(
            @Valid @RequestBody GenerateRecipeRequest request) {
        return ResponseEntity.ok(service.generateRecipe(request));
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> healthCheck(
            @RequestParam(defaultValue = "ok") String ping) {
        return ResponseEntity.ok(Map.of(
            "status", "healthy",
            "service", "ai/generate-recipe",
            "hasApiKey", service.hasApiKey(),
            "ping", ping
        ));
    }
}
