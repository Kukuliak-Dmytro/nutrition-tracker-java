import { RecipeResponse, UpdateRecipe } from "../../../utils/schemas/recipe";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UpdateRecipeSchema } from "../../../utils/schemas/recipe";
import { useUpdateRecipe } from "@/app/hooks/useRecipes";
import { useIngredients } from "@/app/hooks/useIngredients";
import { useFieldArray } from "react-hook-form";
import { toast } from "sonner";
import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
   DialogDescription,
   DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PlusIcon, Trash2 } from "lucide-react";
import {
   Popover,
   PopoverContent,
   PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronsUpDownIcon } from "lucide-react";
import { useEffect, useState } from "react";
import NutritionDisplay from "@/components/recipes/NutritionDisplay";
import {
   calculateRecipeNutrition,
   RecipeIngredient,
} from "../../../utils/calculations/nutrition";
import { IngredientCreateForm } from "./IngredientCreateForm";
import { useRecipeAIContent } from "@/app/hooks/useGenerateRecipeContent";
import { IngredientResponse } from "../../../utils/schemas";

interface RecipeUpdateFormProps {
   children: React.ReactNode;
   isOpen: boolean;
   onOpenChange: (open: boolean) => void;
   recipe: RecipeResponse;
   onSuccessDetailsCard?: () => void;
}

export default function RecipeUpdateForm({
   children,
   isOpen,
   onOpenChange,
   recipe,
   onSuccessDetailsCard,
}: RecipeUpdateFormProps) {
   const [openIngredientIndex, setOpenIngredientIndex] = useState<
      number | null
   >(null);
   const [searchIngredient, setSearchIngredient] = useState("");
   const [debouncedSearch, setDebouncedSearch] = useState("");
   const [selectedIngredients, setSelectedIngredients] = useState<
      Record<string, { id: string; name: string }>
   >({});

   useEffect(() => {
      const timer = setTimeout(() => {
         setDebouncedSearch(searchIngredient);
      }, 300);

      return () => clearTimeout(timer);
   }, [searchIngredient]);

   const { mutate: updateRecipe } = useUpdateRecipe();
   const {
      data: ingredientsData,
      fetchNextPage,
      hasNextPage,
      isFetchingNextPage,
   } = useIngredients({
      search: debouncedSearch,
      limit: 50,
   });
   const filteredIngredients = ingredientsData?.pages.flatMap(
      (page) => page.data
   );
   const {
      register,
      handleSubmit,
      formState: { errors, isSubmitting },
      reset,
      control,
      watch,
      setValue,
   } = useForm({
      resolver: zodResolver(UpdateRecipeSchema),
      defaultValues: recipe,
   });

   const watchedIngredients = watch("ingredients");
   const watchedServings = watch("servings") as number;

   const { onGenerate, isPendingDesc, isPendingInstr } = useRecipeAIContent({
      watch,
      setValue,
      resolveIngredientName: (id: string) => {
         return (
            selectedIngredients[id]?.name ||
            (ingredientsData?.pages.flatMap((page) => page.data).find(
               (ingredient) => ingredient.id === id
            ) as IngredientResponse)?.name ||
            ""
         );
      }
   })

   const { fields, append, remove } = useFieldArray({
      control,
      name: "ingredients",
   });

   const calculateCurrentNutrition = () => {
      if (watchedIngredients?.length === 0) return null;

      interface IngredientData {
         id?: string;
         name: string;
         caloriesPer100g: number | string | { toString(): string };
         proteinPer100g: number | string | { toString(): string };
         carbsPer100g: number | string | { toString(): string };
         fatPer100g: number | string | { toString(): string };
      }
      const ingredientDataMap: Record<string, IngredientData> = {};

      recipe.ingredients?.forEach((recipeIng) => {
         if (recipeIng.ingredient) {
            ingredientDataMap[recipeIng.ingredientId] = recipeIng.ingredient;
         }
      });

      ingredientsData?.pages
         .flatMap((page) => page.data)
         .forEach((ing) => {
            if (ing.id) {
               ingredientDataMap[ing.id] = ing;
            }
         });

      const ingredientsWithNutrition = watchedIngredients
         ?.filter(
            (ingredient) => ingredient.ingredientId && ingredient.quantityGrams
         )
         .map((ingredient) => {
            const ingredientData = ingredientDataMap[ingredient.ingredientId];

            if (!ingredientData) {
               return null;
            }

            return {
               ingredientId: ingredient.ingredientId,
               quantityGrams: ingredient.quantityGrams,
               nutritionalData: {
                  calories: Number(
                     typeof ingredientData.caloriesPer100g === 'object'
                        ? ingredientData.caloriesPer100g.toString()
                        : ingredientData.caloriesPer100g
                  ),
                  protein: Number(
                     typeof ingredientData.proteinPer100g === 'object'
                        ? ingredientData.proteinPer100g.toString()
                        : ingredientData.proteinPer100g
                  ),
                  carbs: Number(
                     typeof ingredientData.carbsPer100g === 'object'
                        ? ingredientData.carbsPer100g.toString()
                        : ingredientData.carbsPer100g
                  ),
                  fat: Number(
                     typeof ingredientData.fatPer100g === 'object'
                        ? ingredientData.fatPer100g.toString()
                        : ingredientData.fatPer100g
                  ),
               },
            };
         })
         .filter(
            (ingredient): ingredient is RecipeIngredient => ingredient !== null
         );

      if (ingredientsWithNutrition?.length === 0) return null;

      return calculateRecipeNutrition(ingredientsWithNutrition!);
   };

   useEffect(() => {
      reset(recipe);
   }, [recipe, reset]);

   useEffect(() => {
      if (isOpen && recipe.ingredients) {
         const initialSelected: Record<string, { id: string; name: string }> =
            {};
         recipe.ingredients.forEach((recipeIng) => {
            if (recipeIng.ingredient) {
               initialSelected[recipeIng.ingredientId] = {
                  id: recipeIng.ingredient.id,
                  name: recipeIng.ingredient.name,
               };
            }
         });
         setSelectedIngredients(initialSelected);
      } else if (!isOpen) {
         setSelectedIngredients({});
      }
   }, [isOpen, recipe.ingredients]);

   const onSubmit = (data: UpdateRecipe) => {
      updateRecipe(
         { id: recipe.id!, recipe: data },
         {
            onSuccess: () => {
               toast.success(`Recipe ${data.name} updated successfully!`);
               onOpenChange(false);
               onSuccessDetailsCard?.();
            },
            onError: () => {
               toast.error(`Failed to update recipe ${data.name}`);
               onOpenChange(false);
            },
         }
      );
   };

   return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
         <DialogTrigger asChild>{children}</DialogTrigger>
         <DialogContent className="max-w-5xl sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
               <DialogTitle> Edit Recipe</DialogTitle>
               <DialogDescription>Edit the recipe details.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
               <div className="space-y-4">
                  <div className="border-b pb-2">
                     <h3 className="text-lg font-semibold">
                        Basic Information
                     </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-medium">
                           Recipe Name *
                        </Label>
                        <Input
                           type="text"
                           id="name"
                           {...register("name")}
                           placeholder="Enter recipe name"
                           className="w-full"
                        />
                        {errors.name && (
                           <p className="text-sm text-red-500">
                              {errors.name.message}
                           </p>
                        )}
                     </div>
                     <div className="space-y-2">
                        <Label
                           htmlFor="servings"
                           className="text-sm font-medium">
                           Servings *
                        </Label>
                        <Input
                           type="number"
                           id="servings"
                           {...register("servings")}
                           placeholder="Number of servings"
                           className="w-full"
                        />
                        {errors.servings && (
                           <p className="text-sm text-red-500">
                              {errors.servings.message}
                           </p>
                        )}
                     </div>
                  </div>
               </div>

               <div className="space-y-4">
                  <div className="border-b pb-2">
                     <h3 className="text-lg font-semibold">Recipe Details</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <Label
                           htmlFor="cookingTime"
                           className="text-sm font-medium">
                           Cooking Time
                        </Label>
                        <Input
                           type="text"
                           id="cookingTime"
                           {...register("cookingTime")}
                           placeholder="e.g., 30 minutes"
                           className="w-full"
                        />
                        {errors.cookingTime && (
                           <p className="text-sm text-red-500">
                              {errors.cookingTime.message}
                           </p>
                        )}
                     </div>
                     <div className="space-y-2">
                        <Label htmlFor="rating" className="text-sm font-medium">
                           Rating
                        </Label>
                        <Input
                           type="number"
                           id="rating"
                           {...register("rating")}
                           placeholder="1-100"
                           min="1"
                           max="100"
                           className="w-full"
                        />
                        {errors.rating && (
                           <p className="text-sm text-red-500">
                              {errors.rating.message}
                           </p>
                        )}
                     </div>
                  </div>
               </div>
               <div className="space-y-4">
                  <div className="border-b pb-2">
                     <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Ingredients</h3>
                        <Button
                           type="button"
                           variant="outline"
                           size="sm"
                           onClick={() =>
                              append({ ingredientId: "", quantityGrams: 0 })
                           }
                           className="flex items-center gap-2">
                           <PlusIcon className="h-4 w-4" />
                           Add Ingredient
                        </Button>
                     </div>
                  </div>
                  {errors.ingredients?.root?.message && (
                     <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-600 font-medium">
                           {errors.ingredients.root.message}
                        </p>
                     </div>
                  )}
                  <div className="space-y-3">
                     {fields.map((field, index) => (
                        <div
                           key={field.id}
                           className={`grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-4 p-4 border rounded-lg bg-card shadow-sm ${
                              errors.ingredients?.[index]
                                 ? "border-red-200 bg-red-50/30"
                                 : ""
                           }`}>
                           <div className="space-y-2 min-w-0">
                              <Label
                                 htmlFor={`ingredients.${index}.ingredientId`}
                                 className="text-sm font-medium text-foreground">
                                 Ingredient №{index + 1}
                              </Label>
                              <Popover
                                 open={openIngredientIndex === index}
                                 onOpenChange={(open) =>
                                    setOpenIngredientIndex(open ? index : null)
                                 }>
                                 <PopoverTrigger asChild>
                                    <button
                                       type="button"
                                       role="combobox"
                                       aria-controls={`ingredients.${index}.ingredientId`}
                                       aria-expanded={
                                          openIngredientIndex === index
                                       }
                                       className={`flex items-center justify-between w-full h-10 px-3 py-2 text-sm border rounded-md bg-background shadow-md hover:bg-accent hover:text-accent-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer ${
                                          errors.ingredients?.[index]
                                             ?.ingredientId
                                             ? "border-red-500 focus:border-red-500"
                                             : "border-input"
                                       }`}>
                                       <span
                                          className="truncate text-left pr-2 flex-1"
                                          style={{ minWidth: 0 }}>
                                          {watchedIngredients?.[index]
                                             ?.ingredientId ? (
                                             selectedIngredients[
                                                watchedIngredients[index]
                                                   ?.ingredientId
                                             ]?.name ||
                                             ingredientsData?.pages
                                                .flatMap((page) => page.data)
                                                .find(
                                                   (ingredient) =>
                                                      ingredient.id ===
                                                      watchedIngredients[index]
                                                         ?.ingredientId
                                                )?.name ||
                                             "Select ingredient..."
                                          ) : (
                                             <span className="text-muted-foreground">
                                                Select ingredient...
                                             </span>
                                          )}
                                       </span>
                                       <ChevronsUpDownIcon className="h-4 w-4 shrink-0 opacity-50 ml-2" />
                                    </button>
                                 </PopoverTrigger>
                                 <PopoverContent className="w-96 p-0">
                                    <div>
                                       <div className="p-2 border-b">
                                          <Input
                                             type="text"
                                             value={searchIngredient}
                                             onChange={(e) =>
                                                setSearchIngredient(
                                                   e.target.value
                                                )
                                             }
                                             placeholder="Search ingredient by name or category"
                                          />
                                       </div>
                                       <div className="max-h-70 overflow-y-auto">
                                          {filteredIngredients?.map(
                                             (ingredient) => (
                                                <div
                                                   key={ingredient.id}
                                                   className="p-2 hover:bg-muted cursor-pointer"
                                                   onClick={() => {
                                                      setValue(
                                                         `ingredients.${index}.ingredientId`,
                                                         ingredient.id ?? ""
                                                      );
                                                      setSelectedIngredients(
                                                         (prev) => ({
                                                            ...prev,
                                                            [ingredient.id!]: {
                                                               id: ingredient.id!,
                                                               name: ingredient.name,
                                                            },
                                                         })
                                                      );
                                                      setOpenIngredientIndex(
                                                         null
                                                      );
                                                   }}>
                                                   <div className="flex flex-col gap-1.5 min-w-0">
                                                      <span
                                                         className="font-medium truncate"
                                                         title={
                                                            ingredient.name
                                                         }>
                                                         {ingredient.name}
                                                      </span>
                                                      <div className="text-xs text-muted-foreground truncate">
                                                         {
                                                            ingredient.caloriesPer100g
                                                         }{" "}
                                                         cal •{" "}
                                                         {
                                                            ingredient.proteinPer100g
                                                         }
                                                         g protein •{" "}
                                                         {
                                                            ingredient.carbsPer100g
                                                         }
                                                         g carbs •{" "}
                                                         {ingredient.fatPer100g}
                                                         g fat
                                                         {ingredient.category && (
                                                            <span>
                                                               {" "}
                                                               •{" "}
                                                               {
                                                                  ingredient.category
                                                               }
                                                            </span>
                                                         )}
                                                      </div>
                                                   </div>
                                                </div>
                                             )
                                          )}
                                       </div>
                                       <div className="p-2 border-t flex gap-2">
                                          <IngredientCreateForm>
                                             <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="flex-1">
                                                <PlusIcon className="h-4 w-4 mr-2" />
                                                <span className="text-sm font-medium">
                                                   Create New
                                                </span>
                                             </Button>
                                          </IngredientCreateForm>
                                          {hasNextPage && (
                                             <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => fetchNextPage()}
                                                disabled={isFetchingNextPage}
                                                className="flex-1">
                                                {isFetchingNextPage
                                                   ? "Loading..."
                                                   : "Load More"}
                                             </Button>
                                          )}
                                       </div>
                                    </div>
                                 </PopoverContent>
                              </Popover>
                              {errors.ingredients?.[index]?.ingredientId
                                 ?.message && (
                                 <p className="text-sm text-red-500 mt-1">
                                    {
                                       errors.ingredients?.[index]?.ingredientId
                                          ?.message
                                    }
                                 </p>
                              )}
                           </div>

                           <div className="space-y-2">
                              <Label
                                 htmlFor={`ingredients.${index}.quantityGrams`}
                                 className="text-sm font-medium text-foreground">
                                 Quantity (g)
                              </Label>
                              <Input
                                 type="number"
                                 id={`ingredients.${index}.quantityGrams`}
                                 {...register(
                                    `ingredients.${index}.quantityGrams`
                                 )}
                                 placeholder="0"
                                 min="0"
                                 max="1000"
                                 step="0.1"
                                 className={`w-24 h-10 ${
                                    errors.ingredients?.[index]?.quantityGrams
                                       ? "border-red-500 focus:border-red-500"
                                       : ""
                                 }`}
                              />
                              {errors.ingredients?.[index]?.quantityGrams
                                 ?.message && (
                                 <p className="text-sm text-red-500">
                                    {
                                       errors.ingredients?.[index]
                                          ?.quantityGrams?.message
                                    }
                                 </p>
                              )}
                           </div>

                           <div className="flex items-end">
                              <Button
                                 type="button"
                                 variant="outline"
                                 size="icon"
                                 onClick={() => remove(index)}
                                 className="h-10 w-10 text-destructive hover:bg-destructive hover:text-destructive-foreground">
                                 <Trash2 className="h-4 w-4" />
                              </Button>
                           </div>
                        </div>
                     ))}
                  </div>
                  <div className="space-y-2">
                     <div className="flex items-center justify-between">
                     <Label
                        htmlFor="description"
                        className="text-sm font-medium">
                        Description
                     </Label>
                     <Button
                        type="button"
                        variant="default"
                        size="sm"
                        onClick={() => onGenerate("description")}>
                        {isPendingDesc ? "Generating..." : "Generate"}
                     </Button>
                     </div>
                     <Textarea
                        rows={3}
                        id="description"
                        {...register("description")}
                        placeholder="Brief description of the recipe"
                        className="w-full"
                     />
                     {errors.description && (
                        <p className="text-sm text-red-500">
                           {errors.description.message}
                        </p>
                     )}
                  </div>
                  <div className="space-y-2">
                     <div className="flex items-center justify-between">
                     <Label
                        htmlFor="instructions"
                        className="text-sm font-medium">
                        Instructions
                     </Label>
                     <Button
                        type="button"
                        variant="default"
                        size="sm"
                        onClick={() => onGenerate("instructions")}>
                        {isPendingInstr ? "Generating..." : "Generate"}
                     </Button>
                     </div>
                     <Textarea
                        rows={6}
                        id="instructions"
                        {...register("instructions")}
                        placeholder="Step-by-step cooking instructions. Each step on a new line."
                        className="w-full resize-y"
                     />
                     <p className="text-xs text-muted-foreground">
                        Tip: Write each step on a separate line for better
                        formatting
                     </p>
                     {errors.instructions && (
                        <p className="text-sm text-red-500">
                           {errors.instructions.message}
                        </p>
                     )}
                  </div>
               </div>
               {ingredientsData &&
                  watchedIngredients?.length &&
                  watchedIngredients?.length > 0 &&
                  calculateCurrentNutrition() && (
                     <div className="space-y-4">
                        <div className="border-b pb-2">
                           <h3 className="text-lg font-semibold">
                              Nutritional Information
                           </h3>
                        </div>
                        <div className="space-y-4">
                           <div>
                              <h4 className="text-sm font-medium mb-2">
                                 Total Recipe
                              </h4>
                              <NutritionDisplay
                                 nutrition={calculateCurrentNutrition()!}
                                 servings={watchedServings}
                                 showPerServing={false}
                              />
                           </div>
                           <div>
                              <h4 className="text-sm font-medium mb-2">
                                 Per Serving ({watchedServings} servings)
                              </h4>
                              <NutritionDisplay
                                 nutrition={calculateCurrentNutrition()!}
                                 servings={watchedServings}
                                 showPerServing={true}
                              />
                           </div>
                        </div>
                     </div>
                  )}

               <div className="flex justify-end pt-4 border-t gap-2">
                  <Button
                     type="button"
                     variant="outline"
                     onClick={() => onOpenChange(false)}>
                     Cancel
                  </Button>
                  <Button
                     type="submit"
                     disabled={isSubmitting}
                     className="px-8">
                     {isSubmitting ? "Editing..." : "Edit"}
                  </Button>
               </div>
            </form>
         </DialogContent>
      </Dialog>
   );
}
