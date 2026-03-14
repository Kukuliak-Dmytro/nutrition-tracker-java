package com.nutritiontracker.service;

import com.nutritiontracker.dto.request.CreateIngredientRequest;
import com.nutritiontracker.dto.request.IngredientQueryParams;
import com.nutritiontracker.dto.request.UpdateIngredientRequest;
import com.nutritiontracker.dto.response.IngredientResponse;
import com.nutritiontracker.dto.response.PaginatedResponse;
import com.nutritiontracker.entity.Ingredient;
import com.nutritiontracker.exception.ResourceNotFoundException;
import com.nutritiontracker.mapper.IngredientMapper;
import com.nutritiontracker.repository.IngredientRepository;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class IngredientService {

    private static final Set<String> VALID_SORT_FIELDS = Set.of(
        "name", "caloriesPer100g", "proteinPer100g", "carbsPer100g", "fatPer100g", "category", "createdAt"
    );

    // Map frontend field names to entity field names
    private static final Map<String, String> SORT_FIELD_MAP = Map.of(
        "name", "name",
        "caloriesPer100g", "caloriesPer100g",
        "proteinPer100g", "proteinPer100g",
        "carbsPer100g", "carbsPer100g",
        "fatPer100g", "fatPer100g",
        "category", "category",
        "createdAt", "createdAt"
    );

    private final IngredientRepository repository;

    public IngredientService(IngredientRepository repository) {
        this.repository = repository;
    }

    @Retryable(retryFor = DataAccessException.class, maxAttempts = 3,
               backoff = @Backoff(delay = 1000, multiplier = 2))
    @Transactional(readOnly = true)
    public PaginatedResponse<IngredientResponse> getIngredients(IngredientQueryParams params) {
        int limit = params.effectiveLimit();
        String sortField = SORT_FIELD_MAP.getOrDefault(params.effectiveSortBy(), "name");
        Sort sort = Sort.by("asc".equals(params.effectiveSortOrder()) ? Sort.Direction.ASC : Sort.Direction.DESC, sortField);

        Specification<Ingredient> spec = buildSpecification(params);
        long total = repository.count(spec);

        // Fetch limit+1 for cursor detection
        List<Ingredient> allMatching = repository.findAll(spec, sort);

        // Apply cursor-based pagination
        List<Ingredient> results;
        if (params.cursor() != null && !params.cursor().isBlank()) {
            UUID cursorId = UUID.fromString(params.cursor());
            int cursorIndex = -1;
            for (int i = 0; i < allMatching.size(); i++) {
                if (allMatching.get(i).getId().equals(cursorId)) {
                    cursorIndex = i;
                    break;
                }
            }
            results = cursorIndex >= 0
                ? allMatching.subList(Math.min(cursorIndex + 1, allMatching.size()),
                                      Math.min(cursorIndex + 1 + limit + 1, allMatching.size()))
                : allMatching.subList(0, Math.min(limit + 1, allMatching.size()));
        } else {
            results = allMatching.subList(0, Math.min(limit + 1, allMatching.size()));
        }

        boolean hasMore = results.size() > limit;
        List<Ingredient> data = hasMore ? results.subList(0, limit) : results;
        String nextCursor = hasMore && !data.isEmpty() ? data.get(data.size() - 1).getId().toString() : null;

        List<IngredientResponse> responseData = data.stream()
            .map(IngredientMapper::toResponse)
            .toList();

        return new PaginatedResponse<>(responseData, nextCursor, hasMore, total);
    }

    @Transactional(readOnly = true)
    public IngredientResponse getIngredient(UUID id) {
        Ingredient ingredient = repository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Ingredient", id));
        return IngredientMapper.toResponse(ingredient);
    }

    @Transactional
    public IngredientResponse createIngredient(CreateIngredientRequest request) {
        Ingredient ingredient = IngredientMapper.toEntity(request);
        Ingredient saved = repository.save(ingredient);
        return IngredientMapper.toResponse(saved);
    }

    @Transactional
    public IngredientResponse updateIngredient(UUID id, UpdateIngredientRequest request) {
        Ingredient ingredient = repository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Ingredient", id));
        IngredientMapper.updateEntity(ingredient, request);
        Ingredient saved = repository.save(ingredient);
        return IngredientMapper.toResponse(saved);
    }

    @Transactional
    public IngredientResponse deleteIngredient(UUID id) {
        Ingredient ingredient = repository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Ingredient", id));
        repository.delete(ingredient);
        return IngredientMapper.toResponse(ingredient);
    }

    private Specification<Ingredient> buildSpecification(IngredientQueryParams params) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (params.search() != null && !params.search().isBlank()) {
                String search = "%" + params.search().trim().toLowerCase() + "%";
                predicates.add(cb.or(
                    cb.like(cb.lower(root.get("name")), search),
                    cb.like(cb.lower(root.get("category")), search)
                ));
            }

            if (params.minCalories() != null) predicates.add(cb.greaterThanOrEqualTo(root.get("caloriesPer100g"), params.minCalories()));
            if (params.maxCalories() != null) predicates.add(cb.lessThanOrEqualTo(root.get("caloriesPer100g"), params.maxCalories()));
            if (params.minProtein() != null) predicates.add(cb.greaterThanOrEqualTo(root.get("proteinPer100g"), params.minProtein()));
            if (params.maxProtein() != null) predicates.add(cb.lessThanOrEqualTo(root.get("proteinPer100g"), params.maxProtein()));
            if (params.minCarbs() != null) predicates.add(cb.greaterThanOrEqualTo(root.get("carbsPer100g"), params.minCarbs()));
            if (params.maxCarbs() != null) predicates.add(cb.lessThanOrEqualTo(root.get("carbsPer100g"), params.maxCarbs()));
            if (params.minFat() != null) predicates.add(cb.greaterThanOrEqualTo(root.get("fatPer100g"), params.minFat()));
            if (params.maxFat() != null) predicates.add(cb.lessThanOrEqualTo(root.get("fatPer100g"), params.maxFat()));

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
