package com.nutritiontracker.controller;

import com.nutritiontracker.dto.request.CookingHistoryQueryParams;
import com.nutritiontracker.dto.request.CreateCookingHistoryRequest;
import com.nutritiontracker.dto.response.CookingHistoryResponse;
import com.nutritiontracker.dto.response.CookingStatsResponse;
import com.nutritiontracker.dto.response.NutritionSummaryResponse;
import com.nutritiontracker.dto.response.PaginatedCookingHistoryResponse;
import com.nutritiontracker.service.CookingHistoryService;
import com.nutritiontracker.service.CookingStatsService;
import com.nutritiontracker.service.NutritionSummaryService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/api/cooking-history")
public class CookingHistoryController {

    private final CookingHistoryService cookingHistoryService;
    private final CookingStatsService cookingStatsService;
    private final NutritionSummaryService nutritionSummaryService;

    public CookingHistoryController(CookingHistoryService cookingHistoryService,
                                     CookingStatsService cookingStatsService,
                                     NutritionSummaryService nutritionSummaryService) {
        this.cookingHistoryService = cookingHistoryService;
        this.cookingStatsService = cookingStatsService;
        this.nutritionSummaryService = nutritionSummaryService;
    }

    @GetMapping
    public ResponseEntity<PaginatedCookingHistoryResponse> getCookingHistory(
            @RequestParam(required = false) String cursor,
            @RequestParam(required = false) Integer limit,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) LocalDateTime startDate,
            @RequestParam(required = false) LocalDateTime endDate,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String sortOrder) {

        CookingHistoryQueryParams params = new CookingHistoryQueryParams(
            cursor, limit, page, search, startDate, endDate, sortBy, sortOrder
        );
        return ResponseEntity.ok(cookingHistoryService.getCookingHistory(params));
    }

    @PostMapping
    public ResponseEntity<CookingHistoryResponse> createCookingHistory(
            @Valid @RequestBody CreateCookingHistoryRequest request) {
        return ResponseEntity.ok(cookingHistoryService.createCookingHistory(request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<CookingHistoryResponse> deleteCookingHistory(@PathVariable UUID id) {
        return ResponseEntity.ok(cookingHistoryService.deleteCookingHistory(id));
    }

    @GetMapping("/stats")
    public ResponseEntity<CookingStatsResponse> getStats() {
        return ResponseEntity.ok(cookingStatsService.getStats());
    }

    @GetMapping("/nutrition")
    public ResponseEntity<NutritionSummaryResponse> getWeeklyNutrition() {
        return ResponseEntity.ok(nutritionSummaryService.getWeeklyNutrition());
    }
}
