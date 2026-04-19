package com.nutritiontracker.dto.request;

import java.time.LocalDateTime;

public record CookingHistoryQueryParams(
    String cursor,
    Integer limit,
    Integer page,
    String search,
    LocalDateTime startDate,
    LocalDateTime endDate,
    String sortBy,
    String sortOrder
) {
    public int effectiveLimit() {
        return limit != null && limit > 0 ? Math.min(limit, 10000) : 20;
    }

    public String effectiveSortOrder() {
        return sortOrder != null ? sortOrder : "desc";
    }
}
