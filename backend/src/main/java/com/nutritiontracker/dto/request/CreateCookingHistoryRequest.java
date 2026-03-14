package com.nutritiontracker.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PastOrPresent;
import java.time.LocalDateTime;

public record CreateCookingHistoryRequest(
    @NotBlank(message = "Recipe ID is required")
    String recipeId,

    @PastOrPresent(message = "Cooked at must be in the past")
    LocalDateTime cookedAt
) {}
