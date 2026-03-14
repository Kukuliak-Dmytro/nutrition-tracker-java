export interface NutritionalData {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface RecipeIngredient {
  ingredientId: string;
  quantityGrams: number;
  nutritionalData: NutritionalData;
}

export function calculateIngredientNutrition(
  nutritionalDataPer100g: NutritionalData,
  quantityGrams: number
): NutritionalData {
  return {
    calories:
      Math.round(
        ((nutritionalDataPer100g.calories * quantityGrams) / 100) * 10
      ) / 10,
    protein:
      Math.round(
        ((nutritionalDataPer100g.protein * quantityGrams) / 100) * 10
      ) / 10,
    carbs:
      Math.round(((nutritionalDataPer100g.carbs * quantityGrams) / 100) * 10) /
      10,
    fat:
      Math.round(((nutritionalDataPer100g.fat * quantityGrams) / 100) * 10) /
      10,
  };
}

export function calculateRecipeNutrition(
  recipeIngredients: RecipeIngredient[]
): NutritionalData {
  return recipeIngredients.reduce((total, ingredient) => {
    const calcNutrition = calculateIngredientNutrition(
      ingredient.nutritionalData,
      ingredient.quantityGrams
    );

    return {
      calories: total.calories + calcNutrition.calories,
      protein: total.protein + calcNutrition.protein,
      carbs: total.carbs + calcNutrition.carbs,
      fat: total.fat + calcNutrition.fat,
    };
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
}


export function calculateNutritionPerServing(totalNutrition: NutritionalData, servings: number): NutritionalData {
    return {
        calories: Math.round((totalNutrition.calories / servings) * 10) / 10,
        protein: Math.round((totalNutrition.protein / servings) * 10) / 10,
        carbs: Math.round((totalNutrition.carbs / servings) * 10) / 10,
        fat: Math.round((totalNutrition.fat / servings) * 10) / 10,
    }
}

// Helper function to calculate nutrition from RecipeResponse
// Accepts Prisma Decimal types and converts them to numbers
interface RecipeIngredientInput {
    ingredientId: string;
    quantityGrams: number | string | { toString(): string };
    ingredient: {
        caloriesPer100g: number | string | { toString(): string };
        proteinPer100g: number | string | { toString(): string };
        carbsPer100g: number | string | { toString(): string };
        fatPer100g: number | string | { toString(): string };
    };
}

interface RecipeInput {
    ingredients?: RecipeIngredientInput[];
}

export function calculateRecipeNutritionData(recipe: RecipeInput): NutritionalData {
    if (!recipe.ingredients || recipe.ingredients.length === 0) {
        return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    }

    const recipeIngredients: RecipeIngredient[] = recipe.ingredients.map(
        (ingredient: RecipeIngredientInput) => ({
            ingredientId: ingredient.ingredientId,
            quantityGrams: Number(
                typeof ingredient.quantityGrams === 'object' 
                    ? ingredient.quantityGrams.toString() 
                    : ingredient.quantityGrams
            ),
            nutritionalData: {
                calories: Number(
                    typeof ingredient.ingredient.caloriesPer100g === 'object'
                        ? ingredient.ingredient.caloriesPer100g.toString()
                        : ingredient.ingredient.caloriesPer100g
                ),
                protein: Number(
                    typeof ingredient.ingredient.proteinPer100g === 'object'
                        ? ingredient.ingredient.proteinPer100g.toString()
                        : ingredient.ingredient.proteinPer100g
                ),
                carbs: Number(
                    typeof ingredient.ingredient.carbsPer100g === 'object'
                        ? ingredient.ingredient.carbsPer100g.toString()
                        : ingredient.ingredient.carbsPer100g
                ),
                fat: Number(
                    typeof ingredient.ingredient.fatPer100g === 'object'
                        ? ingredient.ingredient.fatPer100g.toString()
                        : ingredient.ingredient.fatPer100g
                ),
            },
        })
    );

    return calculateRecipeNutrition(recipeIngredients);
}