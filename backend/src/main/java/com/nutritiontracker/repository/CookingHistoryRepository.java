package com.nutritiontracker.repository;

import com.nutritiontracker.entity.CookingHistory;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface CookingHistoryRepository extends JpaRepository<CookingHistory, UUID>,
                                                   JpaSpecificationExecutor<CookingHistory> {

    long countByCookedAtBetween(LocalDateTime start, LocalDateTime end);

    long countByCookedAtGreaterThanEqual(LocalDateTime start);

    List<CookingHistory> findTop100ByOrderByCookedAtDesc();

    @Query("SELECT ch.recipe.id, COUNT(ch) FROM CookingHistory ch GROUP BY ch.recipe.id ORDER BY COUNT(ch) DESC")
    List<Object[]> findRecipeCookCounts(Pageable pageable);

    @Query("SELECT ch.recipe.id, COUNT(ch) FROM CookingHistory ch GROUP BY ch.recipe.id ORDER BY COUNT(ch) DESC")
    List<Object[]> findAllRecipeCookCounts();

    @Query("SELECT ch FROM CookingHistory ch JOIN FETCH ch.recipe r LEFT JOIN FETCH r.ingredients ri LEFT JOIN FETCH ri.ingredient WHERE ch.cookedAt BETWEEN :start AND :end")
    List<CookingHistory> findByCookedAtBetweenWithRecipeIngredients(LocalDateTime start, LocalDateTime end);

    @Query("SELECT ch FROM CookingHistory ch JOIN FETCH ch.recipe r LEFT JOIN FETCH r.ingredients ri LEFT JOIN FETCH ri.ingredient ORDER BY ch.cookedAt DESC")
    List<CookingHistory> findRecentWithFullDetails(Pageable pageable);
}
