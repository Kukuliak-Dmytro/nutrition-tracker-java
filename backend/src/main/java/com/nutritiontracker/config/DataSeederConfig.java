package com.nutritiontracker.config;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nutritiontracker.entity.Ingredient;
import com.nutritiontracker.entity.Recipe;
import com.nutritiontracker.entity.RecipeIngredient;
import com.nutritiontracker.repository.IngredientRepository;
import com.nutritiontracker.repository.RecipeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Component
public class DataSeederConfig implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeederConfig.class);

    @Value("${app.seed-on-startup:false}")
    private boolean seedOnStartup;

    private final IngredientRepository ingredientRepository;
    private final RecipeRepository recipeRepository;
    private final ObjectMapper objectMapper;

    public DataSeederConfig(IngredientRepository ingredientRepository,
                             RecipeRepository recipeRepository,
                             ObjectMapper objectMapper) {
        this.ingredientRepository = ingredientRepository;
        this.recipeRepository = recipeRepository;
        this.objectMapper = objectMapper;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (!seedOnStartup) {
            log.info("Data seeding is disabled (app.seed-on-startup=false)");
            return;
        }

        seedIngredients();
        seedRecipes();
    }

    private void seedIngredients() {
        if (ingredientRepository.count() > 0) {
            log.info("Ingredients table is not empty, skipping seed");
            return;
        }

        try {
            InputStream is = new ClassPathResource("data/ingredients.json").getInputStream();
            List<Map<String, Object>> ingredients = objectMapper.readValue(is, new TypeReference<>() {});

            int count = 0;
            for (Map<String, Object> data : ingredients) {
                Ingredient ingredient = new Ingredient();
                ingredient.setName((String) data.get("name"));
                ingredient.setCaloriesPer100g(toBigDecimal(data.get("calories")));
                ingredient.setProteinPer100g(toBigDecimal(data.get("protein")));
                ingredient.setCarbsPer100g(toBigDecimal(data.get("carbs")));
                ingredient.setFatPer100g(toBigDecimal(data.get("fat")));
                ingredient.setCategory(data.get("category") != null ? (String) data.get("category") : "Інше");
                ingredient.setCustom(false);

                ingredientRepository.save(ingredient);
                count++;
            }
            log.info("✓ Seeded {} ingredients", count);
        } catch (Exception e) {
            log.warn("Could not seed ingredients: {}", e.getMessage());
        }
    }

    private void seedRecipes() {
        if (recipeRepository.count() > 0) {
            log.info("Recipes table is not empty, skipping seed");
            return;
        }

        try {
            InputStream is = new ClassPathResource("data/recipes.json").getInputStream();
            List<Map<String, Object>> recipes = objectMapper.readValue(is, new TypeReference<>() {});

            int count = 0;
            for (Map<String, Object> data : recipes) {
                Recipe recipe = new Recipe();
                recipe.setName((String) data.get("name"));
                recipe.setDescription((String) data.get("description"));
                recipe.setInstructions((String) data.get("instructions"));
                recipe.setServings(data.get("servings") != null ? ((Number) data.get("servings")).intValue() : 1);
                recipe.setCookingTime((String) data.get("cookingTime"));
                if (data.get("rating") != null) {
                    recipe.setRating(((Number) data.get("rating")).shortValue());
                }
                recipe.setFavorite(Boolean.TRUE.equals(data.get("isFavorite")));

                // Handle ingredients
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> ingredientsList = (List<Map<String, Object>>) data.get("ingredients");
                if (ingredientsList != null) {
                    for (Map<String, Object> ingData : ingredientsList) {
                        String ingredientName = (String) ingData.get("name");
                        BigDecimal quantity = toBigDecimal(ingData.get("quantityGrams"));

                        Optional<Ingredient> ingredientOpt = ingredientRepository.findByName(ingredientName);
                        if (ingredientOpt.isPresent()) {
                            RecipeIngredient ri = new RecipeIngredient(recipe, ingredientOpt.get(), quantity);
                            recipe.addIngredient(ri);
                        } else {
                            log.warn("Ingredient '{}' not found, skipping for recipe '{}'", ingredientName, recipe.getName());
                        }
                    }
                }

                recipeRepository.save(recipe);
                count++;
            }
            log.info("✓ Seeded {} recipes", count);
        } catch (Exception e) {
            log.warn("Could not seed recipes: {}", e.getMessage());
        }
    }

    private BigDecimal toBigDecimal(Object value) {
        if (value == null) return BigDecimal.ZERO;
        if (value instanceof Number num) return BigDecimal.valueOf(num.doubleValue());
        return new BigDecimal(value.toString());
    }
}
