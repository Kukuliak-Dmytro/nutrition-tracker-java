package com.nutritiontracker.dto.response;

public record NutritionData(
    double calories,
    double protein,
    double carbs,
    double fat
) {
    public static NutritionData zero() {
        return new NutritionData(0, 0, 0, 0);
    }

    public NutritionData add(NutritionData other) {
        return new NutritionData(
            this.calories + other.calories,
            this.protein + other.protein,
            this.carbs + other.carbs,
            this.fat + other.fat
        );
    }

    public NutritionData rounded() {
        return new NutritionData(
            Math.round(calories * 10.0) / 10.0,
            Math.round(protein * 10.0) / 10.0,
            Math.round(carbs * 10.0) / 10.0,
            Math.round(fat * 10.0) / 10.0
        );
    }
}
