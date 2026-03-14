package com.nutritiontracker.dto.response;

import java.util.List;

public record PaginatedCookingHistoryResponse(
    List<CookingHistoryResponse> data,
    String nextCursor,
    boolean hasMore,
    long totalCooks,
    List<CookingHistoryResponse> recentCookingHistory
) {}
