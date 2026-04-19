package com.nutritiontracker.dto.response;

import java.util.List;

public record PaginatedCookingHistoryResponse(
    List<CookingHistoryResponse> data,
    String nextCursor,
    boolean hasMore,
    long totalCount,
    List<CookingHistoryResponse> recentCookingHistory
) {}
