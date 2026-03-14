package com.nutritiontracker.dto.response;

import java.time.LocalDateTime;
import java.util.UUID;

public record CookingHistoryResponse(
    UUID id,
    UUID recipeId,
    LocalDateTime cookedAt,
    LocalDateTime createdAt,
    RecipeResponse recipe
) {}
