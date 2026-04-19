package com.nutritiontracker.service;

import com.nutritiontracker.dto.request.CookingHistoryQueryParams;
import com.nutritiontracker.dto.request.CreateCookingHistoryRequest;
import com.nutritiontracker.dto.response.CookingHistoryResponse;
import com.nutritiontracker.dto.response.PaginatedCookingHistoryResponse;
import com.nutritiontracker.entity.CookingHistory;
import com.nutritiontracker.entity.Recipe;
import com.nutritiontracker.exception.ResourceNotFoundException;
import com.nutritiontracker.mapper.CookingHistoryMapper;
import com.nutritiontracker.repository.CookingHistoryRepository;
import com.nutritiontracker.repository.RecipeRepository;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CookingHistoryService {

    private final CookingHistoryRepository repository;
    private final RecipeRepository recipeRepository;

    public CookingHistoryService(CookingHistoryRepository repository,
                                  RecipeRepository recipeRepository) {
        this.repository = repository;
        this.recipeRepository = recipeRepository;
    }

    @Transactional(readOnly = true)
    public PaginatedCookingHistoryResponse getCookingHistory(CookingHistoryQueryParams params) {
        int limit = params.effectiveLimit();
        String sortOrder = params.effectiveSortOrder();

        // Build where clause
        Specification<CookingHistory> spec = buildSpecification(params);

        // Count total
        long totalCooks = repository.count(spec);

        // Build sort (including ID for deterministic results)
        Sort sort;
        if (params.sortBy() != null) {
            sort = Sort.by("asc".equals(sortOrder) ? Sort.Direction.ASC : Sort.Direction.DESC, params.sortBy(), "id");
        } else {
            sort = Sort.by(Sort.Direction.DESC, "cookedAt", "id");
        }

        // Get recipe cook counts
        Map<UUID, Long> recipeCounts = getRecipeCookCounts();

        // Use standard offset-based pagination
        int page = params.page() != null ? params.page() : 0;
        Pageable pageable = PageRequest.of(page, limit, sort);
        Page<CookingHistory> resultsPage = repository.findAll(spec, pageable);

        List<CookingHistory> data = resultsPage.getContent();
        boolean hasMore = resultsPage.hasNext();
        long totalCooksFromCount = resultsPage.getTotalElements();

        // Map with timesCooked
        List<CookingHistoryResponse> responseData = data.stream()
            .map(ch -> CookingHistoryMapper.toResponseWithTimesCooked(ch,
                recipeCounts.getOrDefault(ch.getRecipe().getId(), 0L).intValue()))
            .toList();

        // Recent cooking history (top 3)
        List<CookingHistoryResponse> recentHistory;
        if (limit >= 3 && data.size() >= 3) {
            recentHistory = responseData.subList(0, 3);
        } else {
            List<CookingHistory> recentRaw = repository.findRecentWithFullDetails(PageRequest.of(0, 3));
            recentHistory = recentRaw.stream()
                .map(ch -> CookingHistoryMapper.toResponseWithTimesCooked(ch,
                    recipeCounts.getOrDefault(ch.getRecipe().getId(), 0L).intValue()))
                .toList();
        }

        return new PaginatedCookingHistoryResponse(responseData, null, hasMore, totalCooksFromCount, recentHistory);
    }

    @Transactional
    public CookingHistoryResponse createCookingHistory(CreateCookingHistoryRequest request) {
        Recipe recipe = recipeRepository.findByIdWithIngredients(UUID.fromString(request.recipeId()))
            .orElseThrow(() -> new ResourceNotFoundException("Recipe", request.recipeId()));

        CookingHistory ch = new CookingHistory();
        ch.setRecipe(recipe);
        ch.setCookedAt(request.cookedAt() != null ? request.cookedAt() : LocalDateTime.now());

        CookingHistory saved = repository.save(ch);
        return CookingHistoryMapper.toResponse(saved);
    }

    @Transactional
    public CookingHistoryResponse deleteCookingHistory(UUID id) {
        CookingHistory ch = repository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Cooking history", id));
        CookingHistoryResponse response = CookingHistoryMapper.toResponse(ch);
        repository.delete(ch);
        return response;
    }

    private Map<UUID, Long> getRecipeCookCounts() {
        return repository.findAllRecipeCookCounts().stream()
            .collect(Collectors.toMap(
                row -> (UUID) row[0],
                row -> (Long) row[1]
            ));
    }

    private Specification<CookingHistory> buildSpecification(CookingHistoryQueryParams params) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Fetch recipe with ingredients eagerly only for the actual data query
            if (query != null && query.getResultType() != Long.class && query.getResultType() != long.class) {
                root.fetch("recipe", JoinType.LEFT)
                    .fetch("ingredients", JoinType.LEFT)
                    .fetch("ingredient", JoinType.LEFT);
                query.distinct(true);
            }

            if (params.startDate() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("cookedAt"),
                    params.startDate().toLocalDate().atStartOfDay()));
            }
            if (params.endDate() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("cookedAt"),
                    params.endDate().toLocalDate().atTime(LocalTime.MAX)));
            }
            if (params.search() != null && !params.search().isBlank()) {
                String search = "%" + params.search().trim().toLowerCase() + "%";
                predicates.add(cb.like(cb.lower(root.get("recipe").get("name")), search));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
