package com.nutritiontracker.service;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class CookingStreakService {

    public int calculateStreak(List<LocalDateTime> cookedAtDates) {
        if (cookedAtDates == null || cookedAtDates.isEmpty()) {
            return 0;
        }

        // Get unique cooking dates (day-level), sorted descending
        List<LocalDate> uniqueDates = cookedAtDates.stream()
            .map(LocalDateTime::toLocalDate)
            .distinct()
            .sorted(Comparator.reverseOrder())
            .toList();

        LocalDate today = LocalDate.now();
        LocalDate yesterday = today.minusDays(1);

        boolean cookedToday = uniqueDates.contains(today);
        boolean cookedYesterday = uniqueDates.contains(yesterday);

        if (!cookedToday && !cookedYesterday) {
            return 0;
        }

        int streak = 0;
        LocalDate currentDate = cookedToday ? today : yesterday;

        for (LocalDate cookingDate : uniqueDates) {
            if (cookingDate.equals(currentDate)) {
                streak++;
                currentDate = currentDate.minusDays(1);
            } else if (ChronoUnit.DAYS.between(cookingDate, currentDate) > 1) {
                break;
            }
        }

        return streak;
    }
}
