package com.nutritiontracker.service;

import com.nutritiontracker.dto.request.CreateRecipeRequest;
import com.nutritiontracker.dto.request.RecipeQueryParams;
import com.nutritiontracker.dto.request.UpdateRecipeRequest;
import com.nutritiontracker.dto.response.NutritionData;
import com.nutritiontracker.dto.response.RecipeListResponse;
import com.nutritiontracker.dto.response.RecipeResponse;
import com.nutritiontracker.entity.Ingredient;
import com.nutritiontracker.entity.Recipe;
import com.nutritiontracker.entity.RecipeIngredient;
import com.nutritiontracker.exception.ResourceNotFoundException;
import com.nutritiontracker.mapper.RecipeMapper;
import com.nutritiontracker.repository.IngredientRepository;
import com.nutritiontracker.repository.RecipeRepository;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.dao.DataAccessException;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class RecipeService {

    private static final Set<String> VALID_PRISMA_FIELDS = Set.of(
        "name", "description", "instructions", "servings", "cookingTime",
        "rating", "isFavorite", "createdAt", "updatedAt"
    );

    private static final Set<String> COMPUTED_FIELDS = Set.of("calories", "protein", "carbs", "fat");

    private final RecipeRepository recipeRepository;
    private final IngredientRepository ingredientRepository;
    private final NutritionCalculationService nutritionService;

    public RecipeService(RecipeRepository recipeRepository,
                         IngredientRepository ingredientRepository,
                         NutritionCalculationService nutritionService) {
        this.recipeRepository = recipeRepository;
        this.ingredientRepository = ingredientRepository;
        this.nutritionService = nutritionService;
    }

    @Retryable(retryFor = DataAccessException.class, maxAttempts = 3,
               backoff = @Backoff(delay = 1000, multiplier = 2))
    @Transactional(readOnly = true)
    public RecipeListResponse getRecipes(RecipeQueryParams params) {
        Specification<Recipe> spec = buildSpecification(params);
        long total = recipeRepository.count(spec);

        // Determine sort
        String sortBy = params.sortBy();
        String sortOrder = params.effectiveSortOrder();
        Sort sort;
        if (sortBy != null && VALID_PRISMA_FIELDS.contains(sortBy)) {
            sort = Sort.by("asc".equals(sortOrder) ? Sort.Direction.ASC : Sort.Direction.DESC, sortBy);
        } else if (sortBy == null || !COMPUTED_FIELDS.contains(sortBy)) {
            sort = Sort.by(Sort.Direction.DESC, "isFavorite");
        } else {
            sort = Sort.unsorted(); // Will sort post-fetch for computed fields
        }

        List<Recipe> recipes = recipeRepository.findAll(spec, sort);

        // Post-fetch filter by computed nutrition values
        List<Recipe> filtered = recipes.stream()
            .filter(recipe -> matchesNutritionFilters(recipe, params))
            .collect(Collectors.toList());

        // Post-fetch sort by computed fields
        if (sortBy != null && COMPUTED_FIELDS.contains(sortBy)) {
            Comparator<Recipe> comparator = Comparator.comparingDouble(r -> {
                NutritionData nd = nutritionService.calculateRecipeNutrition(r);
                return switch (sortBy) {
                    case "calories" -> nd.calories();
                    case "protein" -> nd.protein();
                    case "carbs" -> nd.carbs();
                    case "fat" -> nd.fat();
                    default -> 0;
                };
            });
            if ("desc".equals(sortOrder)) {
                comparator = comparator.reversed();
            }
            filtered.sort(comparator);
        }

        List<RecipeResponse> data = filtered.stream()
            .map(RecipeMapper::toResponse)
            .toList();

        return new RecipeListResponse(data, total);
    }

    @Transactional(readOnly = true)
    public RecipeResponse getRecipe(UUID id) {
        Recipe recipe = recipeRepository.findByIdWithIngredients(id)
            .orElseThrow(() -> new ResourceNotFoundException("Recipe", id));
        return RecipeMapper.toResponse(recipe);
    }

    @Retryable(retryFor = DataAccessException.class, maxAttempts = 3,
               backoff = @Backoff(delay = 1000, multiplier = 2))
    @Transactional
    public RecipeResponse createRecipe(CreateRecipeRequest request) {
        Recipe recipe = new Recipe();
        recipe.setName(request.name());
        recipe.setDescription(request.description());
        recipe.setInstructions(request.instructions());
        recipe.setServings(request.servings());
        recipe.setRating(request.rating());
        recipe.setFavorite(request.isFavorite() != null && request.isFavorite());

        for (CreateRecipeRequest.RecipeIngredientInput input : request.ingredients()) {
            Ingredient ingredient = ingredientRepository.findById(UUID.fromString(input.ingredientId()))
                .orElseThrow(() -> new ResourceNotFoundException("Ingredient", input.ingredientId()));
            RecipeIngredient ri = new RecipeIngredient(recipe, ingredient, input.quantityGrams());
            recipe.addIngredient(ri);
        }

        Recipe saved = recipeRepository.save(recipe);
        return RecipeMapper.toResponse(saved);
    }

    @Transactional
    public RecipeResponse updateRecipe(UUID id, UpdateRecipeRequest request) {
        Recipe recipe = recipeRepository.findByIdWithIngredients(id)
            .orElseThrow(() -> new ResourceNotFoundException("Recipe", id));

        if (request.name() != null) recipe.setName(request.name());
        if (request.description() != null) recipe.setDescription(request.description());
        if (request.instructions() != null) recipe.setInstructions(request.instructions());
        if (request.servings() != null) recipe.setServings(request.servings());
        if (request.cookingTime() != null) recipe.setCookingTime(request.cookingTime());
        if (request.rating() != null) recipe.setRating(request.rating());
        if (request.isFavorite() != null) recipe.setFavorite(request.isFavorite());

        // If ingredients provided: replace all
        if (request.ingredients() != null) {
            recipe.clearIngredients();
            for (UpdateRecipeRequest.RecipeIngredientInput input : request.ingredients()) {
                Ingredient ingredient = ingredientRepository.findById(UUID.fromString(input.ingredientId()))
                    .orElseThrow(() -> new ResourceNotFoundException("Ingredient", input.ingredientId()));
                RecipeIngredient ri = new RecipeIngredient(recipe, ingredient, input.quantityGrams());
                recipe.addIngredient(ri);
            }
        }

        Recipe saved = recipeRepository.save(recipe);
        return RecipeMapper.toResponse(saved);
    }

    @Transactional
    public RecipeResponse deleteRecipe(UUID id) {
        Recipe recipe = recipeRepository.findByIdWithIngredients(id)
            .orElseThrow(() -> new ResourceNotFoundException("Recipe", id));
        RecipeResponse response = RecipeMapper.toResponse(recipe);
        recipeRepository.delete(recipe);
        return response;
    }

    private boolean matchesNutritionFilters(Recipe recipe, RecipeQueryParams params) {
        NutritionData nd = nutritionService.calculateRecipeNutrition(recipe);
        if (params.minCalories() != null && nd.calories() < params.minCalories().doubleValue()) return false;
        if (params.maxCalories() != null && nd.calories() > params.maxCalories().doubleValue()) return false;
        if (params.minProtein() != null && nd.protein() < params.minProtein().doubleValue()) return false;
        if (params.maxProtein() != null && nd.protein() > params.maxProtein().doubleValue()) return false;
        if (params.minCarbs() != null && nd.carbs() < params.minCarbs().doubleValue()) return false;
        if (params.maxCarbs() != null && nd.carbs() > params.maxCarbs().doubleValue()) return false;
        if (params.minFat() != null && nd.fat() < params.minFat().doubleValue()) return false;
        if (params.maxFat() != null && nd.fat() > params.maxFat().doubleValue()) return false;
        return true;
    }

    private Specification<Recipe> buildSpecification(RecipeQueryParams params) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Fetch ingredients eagerly to avoid N+1
            if (query != null && Long.class != query.getResultType()) {
                root.fetch("ingredients", JoinType.LEFT).fetch("ingredient", JoinType.LEFT);
                query.distinct(true);
            }

            if (params.search() != null && !params.search().isBlank()) {
                String search = "%" + params.search().trim().toLowerCase() + "%";
                predicates.add(cb.or(
                    cb.like(cb.lower(root.get("name")), search),
                    cb.like(cb.lower(root.get("description")), search)
                ));
            }

            if (params.ingredients() != null && !params.ingredients().isBlank()) {
                List<UUID> ingredientIds = Arrays.stream(params.ingredients().split(","))
                    .filter(s -> !s.isBlank())
                    .map(String::trim)
                    .map(UUID::fromString)
                    .toList();
                if (!ingredientIds.isEmpty()) {
                    Join<Recipe, RecipeIngredient> ingredientJoin = root.join("ingredients", JoinType.INNER);
                    predicates.add(ingredientJoin.get("ingredient").get("id").in(ingredientIds));
                }
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
