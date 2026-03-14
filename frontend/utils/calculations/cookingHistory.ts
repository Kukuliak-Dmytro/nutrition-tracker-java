import { CookingHistoryResponse } from "../schemas";
import { startOfDay, isSameDay, subDays, differenceInDays } from "date-fns";

export function calculateCookingStreak(cookingHistory: CookingHistoryResponse[]): number {
    if (!cookingHistory || cookingHistory.length === 0) {
        return 0
    }

    const uniqueCookingDates = Array.from(new Set(cookingHistory.map(cooking => startOfDay(cooking.cookedAt).toISOString())))
    .map(dateString => new Date(dateString))
    .sort((a, b) => b.getTime() - a.getTime())

    const today = startOfDay(new Date())
    const yesterday = startOfDay(subDays(today, 1))

    const cookedToday = uniqueCookingDates.some(date => isSameDay(date, today))
    const cookedYesterday = uniqueCookingDates.some(date => isSameDay(date, yesterday))

    if (!cookedToday && !cookedYesterday) {
        return 0
    }

    let streak = 0
    let currentDate = cookedToday ? today : yesterday

    for (const cookingDate of uniqueCookingDates) {
        if (isSameDay(cookingDate, currentDate)) {
            streak++
            currentDate = subDays(currentDate, 1)
        } else if (differenceInDays(currentDate, cookingDate) > 1) {
            break
        }
    }

    return streak
}

