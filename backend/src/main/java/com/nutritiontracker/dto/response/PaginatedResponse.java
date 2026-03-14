package com.nutritiontracker.dto.response;

import java.util.List;

public record PaginatedResponse<T>(
    List<T> data,
    String nextCursor,
    boolean hasMore,
    long totalIngredients
) {}
