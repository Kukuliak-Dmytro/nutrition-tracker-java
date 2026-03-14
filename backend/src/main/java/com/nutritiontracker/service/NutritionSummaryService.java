package com.nutritiontracker.service;

import com.nutritiontracker.dto.response.NutritionData;
import com.nutritiontracker.dto.response.NutritionSummaryResponse;
import com.nutritiontracker.entity.CookingHistory;
import com.nutritiontracker.repository.CookingHistoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.*;
import java.time.temporal.TemporalAdjusters;
import java.util.List;

@Service
public class NutritionSummaryService {

    private final CookingHistoryRepository cookingHistoryRepository;
    private final NutritionCalculationService nutritionService;

    public NutritionSummaryService(CookingHistoryRepository cookingHistoryRepository,
                                    NutritionCalculationService nutritionService) {
        this.cookingHistoryRepository = cookingHistoryRepository;
        this.nutritionService = nutritionService;
    }

    @Transactional(readOnly = true)
    public NutritionSummaryResponse getWeeklyNutrition() {
        LocalDate today = LocalDate.now();
        LocalDateTime weekStart = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.SUNDAY)).atStartOfDay();
        LocalDateTime weekEnd = today.with(TemporalAdjusters.nextOrSame(DayOfWeek.SATURDAY)).atTime(LocalTime.MAX);

        LocalDateTime dayStart = today.atStartOfDay();
        LocalDateTime dayEnd = today.atTime(LocalTime.MAX);

        List<CookingHistory> weeklyCooking = cookingHistoryRepository
            .findByCookedAtBetweenWithRecipeIngredients(weekStart, weekEnd);

        // Weekly nutrition
        NutritionData weeklyNutrition = weeklyCooking.stream()
            .map(ch -> nutritionService.calculateRecipeNutrition(ch.getRecipe()))
            .reduce(NutritionData.zero(), NutritionData::add)
            .rounded();

        // Daily (filter from weekly data — more efficient)
        List<CookingHistory> dailyCooking = weeklyCooking.stream()
            .filter(ch -> !ch.getCookedAt().isBefore(dayStart) && !ch.getCookedAt().isAfter(dayEnd))
            .toList();

        NutritionData dailyNutrition = dailyCooking.stream()
            .map(ch -> nutritionService.calculateRecipeNutrition(ch.getRecipe()))
            .reduce(NutritionData.zero(), NutritionData::add)
            .rounded();

        return new NutritionSummaryResponse(
            weekStart.toInstant(ZoneOffset.UTC).toString(),
            weekEnd.toInstant(ZoneOffset.UTC).toString(),
            dayStart.toInstant(ZoneOffset.UTC).toString(),
            dayEnd.toInstant(ZoneOffset.UTC).toString(),
            weeklyNutrition,
            weeklyCooking.size(),
            dailyNutrition,
            dailyCooking.size()
        );
    }
}
