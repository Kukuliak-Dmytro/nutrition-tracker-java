package com.nutritiontracker.dto.response;

import java.util.List;

public record ErrorResponse(
    String error,
    Object details
) {
    public ErrorResponse(String error) {
        this(error, null);
    }
}
