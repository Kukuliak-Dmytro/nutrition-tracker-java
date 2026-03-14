"use client";
import { Pencil, Trash2, ChefHat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IngredientUpdateForm } from "@/components/forms/IngredientUpdateForm";
import { SortableHeader } from "@/components/layout/SortableHeader";
import { useIngredients } from "@/app/hooks/useIngredients";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState, useEffect, useRef } from "react";
import { IngredientResponse } from "../../../utils/schemas";
import IngredientDelete from "@/components/forms/IngredientDelete";
import { NutritionFilters } from "../ui/NutritionFilters";
import { useSearchParams } from "next/navigation";

type SortableField =
  | "name"
  | "caloriesPer100g"
  | "proteinPer100g"
  | "carbsPer100g"
  | "fatPer100g"
  | "category"
  | "createdAt";

export default function IngredientsContentClient() {
  const searchParams = useSearchParams();
  const [inputValue, setInputValue] = useState(searchParams.get("query") || "");
  const [searchTerm, setSearchTerm] = useState(searchParams.get("query") || "");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIngredient, setSelectedIngredient] =
    useState<IngredientResponse | null>(null);
    const [filters, setFilters] = useState({
      calories: { min: 0, max: 900 },
      protein: { min: 0, max: 100 },
      carbs: { min: 0, max: 100 },
      fat: { min: 0, max: 100 },
    });
  
    const updateFilter = (
      nutrient: "protein" | "carbs" | "fat" | "calories",
      min: number,
      max: number
    ) => {
      setFilters((prev) => ({ ...prev, [nutrient]: { min, max } }));
    };

  const [sortState, setSortState] = useState<
    | {
        field: SortableField;
        order: "asc" | "desc";
      }
    | undefined
  >(undefined);

  const handleSort = (field: SortableField) => {
    setSortState((prev) => {
      if (!prev || prev.field !== field) {
        return { field, order: "asc" };
      } else if (prev.order === "asc") {
        return { field, order: "desc" };
      } else {
        return { field, order: "asc" };
      }
    });
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useIngredients({
    search: searchTerm,
    sortBy: sortState?.field,
    sortOrder: sortState?.order,
    minCalories: filters.calories.min !== 0 ? filters.calories.min : undefined,
    maxCalories:
      filters.calories.max !== 900 ? filters.calories.max : undefined,
    minProtein: filters.protein.min !== 0 ? filters.protein.min : undefined,
    maxProtein: filters.protein.max !== 100 ? filters.protein.max : undefined,
    minCarbs: filters.carbs.min !== 0 ? filters.carbs.min : undefined,
    maxCarbs: filters.carbs.max !== 100 ? filters.carbs.max : undefined,
    minFat: filters.fat.min !== 0 ? filters.fat.min : undefined,
    maxFat: filters.fat.max !== 100 ? filters.fat.max : undefined,
  });

  const filteredIngredients = data?.pages.flatMap((page) => page.data);
  const observerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );
    const currentObserver = observerRef.current;
    if (currentObserver) {
      observer.observe(currentObserver);
    }

    return () => {
      if (currentObserver) {
        observer.unobserve(currentObserver);
      }
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return (
    <div className="w-full flex flex-col gap-8">
      <div className="w-full flex flex-col gap-4">
        <div className="w-full flex flex-col gap-4">
        <NutritionFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          inputValue={inputValue}
          setInputValue={setInputValue}
          fatMin={filters.fat.min}
          fatMax={filters.fat.max}
          onChangeFat={(min, max) => updateFilter("fat", min, max)}
          carbsMin={filters.carbs.min}
          carbsMax={filters.carbs.max}
          onChangeCarbs={(min, max) => updateFilter("carbs", min, max)}
          proteinMin={filters.protein.min}
          proteinMax={filters.protein.max}
          onChangeProtein={(min, max) => updateFilter("protein", min, max)}
          caloriesMin={filters.calories.min}
          caloriesMax={filters.calories.max}
          onChangeCalories={(min, max) => updateFilter("calories", min, max)}
        />
      </div>
      <div className="border border-border rounded-xl overflow-hidden shadow-sm bg-white dark:bg-gray-950">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/80 dark:bg-gray-900/50 hover:bg-gray-50/80 dark:hover:bg-gray-900/50 border-b-2 border-gray-200 dark:border-gray-800 h-16">
              <SortableHeader
                field="name"
                sortState={sortState}
                onSort={handleSort}
              >
                Name
              </SortableHeader>
              <SortableHeader
                field="caloriesPer100g"
                sortState={sortState}
                onSort={handleSort}
              >
                Calories
              </SortableHeader>
              <SortableHeader
                field="proteinPer100g"
                sortState={sortState}
                onSort={handleSort}
              >
                Protein
              </SortableHeader>
              <SortableHeader
                field="carbsPer100g"
                sortState={sortState}
                onSort={handleSort}
              >
                Carbs
              </SortableHeader>
              <SortableHeader
                field="fatPer100g"
                sortState={sortState}
                onSort={handleSort}
              >
                Fat
              </SortableHeader>
              <SortableHeader
                field="category"
                sortState={sortState}
                onSort={handleSort}
              >
                Category
              </SortableHeader>
              <TableHead className="text-right font-semibold text-lg">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <span className="text-base text-muted-foreground">Loading ingredients...</span>
                </TableCell>
              </TableRow>
            )}
            {isError && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-12"
                >
                  <div className="flex flex-col items-center gap-4">
                    <span className="text-base font-medium text-red-600 dark:text-red-400">
                      Failed to load ingredients. Please try again.
                    </span>
                    <Button
                      onClick={() => refetch()}
                      variant="outline"
                      size="sm"
                    >
                      Retry
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {!isLoading && !isError && filteredIngredients?.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <div className="flex flex-col items-center gap-3">
                    <ChefHat className="text-muted-foreground" size={48} />
                    <span className="text-base text-muted-foreground">No ingredients found. Add your first ingredient!</span>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {filteredIngredients?.map((ingredient: IngredientResponse) => (
              <TableRow
                key={ingredient.id}
                className="hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition-colors"
              >
                <TableCell className="py-4">
                  <div className="line-clamp-2 text-lg font-semibold text-foreground max-w-xl" title={ingredient.name}>
                    {ingredient.name}
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <span className="inline-flex items-center px-4 py-2 rounded-lg bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 font-semibold text-base">
                    {ingredient.caloriesPer100g.toString()}kcal
                  </span>
                </TableCell>
                <TableCell className="py-4">
                  <span className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 font-semibold text-base">
                    {ingredient.proteinPer100g.toString()}g
                  </span>
                </TableCell>
                <TableCell className="py-4">
                  <span className="inline-flex items-center px-4 py-2 rounded-lg bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 font-semibold text-base">
                    {ingredient.carbsPer100g.toString()}g
                  </span>
                </TableCell>
                <TableCell className="py-4">
                  <span className="inline-flex items-center px-4 py-2 rounded-lg bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 font-semibold text-base">
                    {ingredient.fatPer100g.toString()}g
                  </span>
                </TableCell>
                <TableCell className="py-4">
                  <span className="text-base font-medium text-muted-foreground">{ingredient.category}</span>
                </TableCell>
                <TableCell className="py-4">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setSelectedIngredient(ingredient);
                        setIsOpen(true);
                      }}
                      className="h-12 w-12 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
                    >
                      <Pencil className="size-5" />
                    </Button>
                    <IngredientDelete ingredient={ingredient}>
                      <Button 
                        type="button" 
                        size="icon" 
                        variant="ghost"
                        className="h-12 w-12 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="size-5" />
                      </Button>
                    </IngredientDelete>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div ref={observerRef} className="h-4" />

        {isFetchingNextPage && (
          <div className="text-center py-6 text-base text-muted-foreground">
            Loading more ingredients...
          </div>
        )}

        {!hasNextPage &&
          filteredIngredients?.length &&
          filteredIngredients.length > 0 && (
            <div className="text-center py-6 text-base text-muted-foreground">
              No more ingredients to load
            </div>
          )}
      </div>
      {selectedIngredient && (
        <IngredientUpdateForm
          key={selectedIngredient.id}
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          ingredient={selectedIngredient}
        />
        )}
      </div>
    </div>
  )
}

