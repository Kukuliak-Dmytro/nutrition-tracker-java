package com.nutritiontracker;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.retry.annotation.EnableRetry;

@SpringBootApplication
@EnableRetry
public class NutritionTrackerApplication {

    public static void main(String[] args) {
        SpringApplication.run(NutritionTrackerApplication.class, args);
    }
}
