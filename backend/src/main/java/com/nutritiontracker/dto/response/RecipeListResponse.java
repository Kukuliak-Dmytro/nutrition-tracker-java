package com.nutritiontracker.dto.response;

import java.util.List;

public record RecipeListResponse(
    List<RecipeResponse> data,
    long totalRecipes
) {}
