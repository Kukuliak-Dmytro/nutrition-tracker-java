package com.nutritiontracker.service;

import com.nutritiontracker.dto.response.*;
import com.nutritiontracker.entity.CookingHistory;
import com.nutritiontracker.entity.Recipe;
import com.nutritiontracker.mapper.CookingHistoryMapper;
import com.nutritiontracker.mapper.RecipeMapper;
import com.nutritiontracker.repository.CookingHistoryRepository;
import com.nutritiontracker.repository.RecipeRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final RecipeRepository recipeRepository;
    private final CookingHistoryRepository cookingHistoryRepository;
    private final CookingStatsService cookingStatsService;
    private final NutritionSummaryService nutritionSummaryService;

    public DashboardService(RecipeRepository recipeRepository,
                             CookingHistoryRepository cookingHistoryRepository,
                             CookingStatsService cookingStatsService,
                             NutritionSummaryService nutritionSummaryService) {
        this.recipeRepository = recipeRepository;
        this.cookingHistoryRepository = cookingHistoryRepository;
        this.cookingStatsService = cookingStatsService;
        this.nutritionSummaryService = nutritionSummaryService;
    }

    @Transactional(readOnly = true)
    public DashboardResponse getDashboard() {
        long totalRecipes = recipeRepository.count();

        // Recent 4 recipes
        List<Recipe> recentRecipeEntities = recipeRepository.findTop4ByOrderByCreatedAtDesc();

        // Get recipe cook counts
        Map<UUID, Long> recipeCounts = cookingHistoryRepository.findAllRecipeCookCounts().stream()
            .collect(Collectors.toMap(
                row -> (UUID) row[0],
                row -> (Long) row[1]
            ));

        List<RecipeResponse> recentRecipes = recentRecipeEntities.stream()
            .map(r -> RecipeMapper.toResponseWithTimesCooked(r,
                recipeCounts.getOrDefault(r.getId(), 0L).intValue()))
            .toList();

        // Cooking stats
        CookingStatsResponse cookingStats = cookingStatsService.getStats();

        // Recent 3 cooking history entries
        List<CookingHistory> recentCookingRaw = cookingHistoryRepository
            .findRecentWithFullDetails(PageRequest.of(0, 3));
        List<CookingHistoryResponse> recentCookingHistory = recentCookingRaw.stream()
            .map(ch -> CookingHistoryMapper.toResponseWithTimesCooked(ch,
                recipeCounts.getOrDefault(ch.getRecipe().getId(), 0L).intValue()))
            .toList();

        // Weekly nutrition
        NutritionSummaryResponse weeklyNutrition = nutritionSummaryService.getWeeklyNutrition();

        return new DashboardResponse(totalRecipes, recentRecipes, cookingStats,
                                     recentCookingHistory, weeklyNutrition);
    }
}
