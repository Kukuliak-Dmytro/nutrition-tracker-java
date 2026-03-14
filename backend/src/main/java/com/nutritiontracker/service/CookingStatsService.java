package com.nutritiontracker.service;

import com.nutritiontracker.dto.response.CookingStatsResponse;
import com.nutritiontracker.entity.CookingHistory;
import com.nutritiontracker.repository.CookingHistoryRepository;
import com.nutritiontracker.repository.RecipeRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.UUID;

@Service
public class CookingStatsService {

    private final CookingHistoryRepository cookingHistoryRepository;
    private final RecipeRepository recipeRepository;
    private final CookingStreakService cookingStreakService;

    public CookingStatsService(CookingHistoryRepository cookingHistoryRepository,
                                RecipeRepository recipeRepository,
                                CookingStreakService cookingStreakService) {
        this.cookingHistoryRepository = cookingHistoryRepository;
        this.recipeRepository = recipeRepository;
        this.cookingStreakService = cookingStreakService;
    }

    @Transactional(readOnly = true)
    public CookingStatsResponse getStats() {
        LocalDate today = LocalDate.now();
        LocalDateTime todayStart = today.atStartOfDay();
        LocalDateTime todayEnd = today.atTime(LocalTime.MAX);
        LocalDateTime weekStart = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.SUNDAY)).atStartOfDay();

        long totalCooks = cookingHistoryRepository.count();
        long todayCooks = cookingHistoryRepository.countByCookedAtBetween(todayStart, todayEnd);
        long thisWeekCooks = cookingHistoryRepository.countByCookedAtGreaterThanEqual(weekStart);

        // Streak
        List<CookingHistory> recentHistory = cookingHistoryRepository.findTop100ByOrderByCookedAtDesc();
        List<LocalDateTime> cookedDates = recentHistory.stream()
            .map(CookingHistory::getCookedAt)
            .toList();
        int currentStreak = cookingStreakService.calculateStreak(cookedDates);

        // Most cooked recipe
        CookingStatsResponse.MostCookedRecipe mostCooked = null;
        List<Object[]> topRecipe = cookingHistoryRepository.findRecipeCookCounts(PageRequest.of(0, 1));
        if (!topRecipe.isEmpty()) {
            UUID recipeId = (UUID) topRecipe.get(0)[0];
            long count = (Long) topRecipe.get(0)[1];
            String recipeName = recipeRepository.findById(recipeId)
                .map(r -> r.getName())
                .orElse("Unknown");
            mostCooked = new CookingStatsResponse.MostCookedRecipe(recipeName, count);
        }

        double weeklyAverage = thisWeekCooks / 7.0;

        return new CookingStatsResponse(totalCooks, todayCooks, thisWeekCooks,
                                        currentStreak, mostCooked, weeklyAverage);
    }
}
