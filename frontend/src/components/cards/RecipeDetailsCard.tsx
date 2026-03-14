import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
   DialogDescription,
   DialogTrigger,
} from "@/components/ui/dialog";
import { RecipeResponse } from "../../../utils/schemas";
import { CookingHistoryResponse } from "../../../utils/schemas/cookingHistory";
import { Button } from "../ui/button";
import {
   ChefHat,
   Clock,
   InfoIcon,
   Star,
   Users,
   ChevronLeft,
   Edit,
   Loader2,
} from "lucide-react";
import { Separator } from "../ui/separator";
import NutritionDisplay from "../recipes/NutritionDisplay";
import { calculateRecipeNutritionData } from "../../../utils/calculations/nutrition";
import RecipeUpdateForm from "@/components/forms/RecipeUpdateForm";
import { useState } from "react";
import { useCreateCookingHistory } from "@/app/hooks/useCookingHistory";
import { useQueryClient } from "@tanstack/react-query";

interface RecipeDetailsCardProps {
   recipe: RecipeResponse | CookingHistoryResponse['recipe'];
   children: React.ReactNode | undefined;
}

export default function RecipeDetailsCard({ recipe, children }: RecipeDetailsCardProps) {
   const [isEditOpen, setIsEditOpen] = useState(false);
   const queryClient = useQueryClient();
   const { mutate: createCookingHistory, isPending } =
      useCreateCookingHistory();
   const handleEditSuccess = () => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
      queryClient.invalidateQueries({ queryKey: ["cooking-history"] });
      queryClient.invalidateQueries({ queryKey: ["recent-cooking-history"] });
      queryClient.invalidateQueries({ queryKey: ["cooking-stats"] });
      setIsEditOpen(false);
   };

   const today = new Date()
   const handleCookedToday = () => {
      createCookingHistory({
         recipeId: recipe.id,
         cookedAt: today,
      });
   };

   return (
      <Dialog>
         <DialogTrigger asChild>
            {children}
         </DialogTrigger>
         <DialogContent className="w-full max-w-[calc(100%-1rem)] max-h-[90vh] sm:max-h-[90vh] overflow-y-auto">
            <DialogHeader>
               <DialogTitle className="text-2xl">{recipe.name}</DialogTitle>
               {recipe.description && (
                  <DialogDescription className="text-base pt-2">
                     {recipe.description}
                  </DialogDescription>
               )}
            </DialogHeader>
            <div className="flex items-center justify-center h-64 w-full rounded-lg bg-gradient-to-tl from-primary/90 via-orange-500/90 to-accent">
               <ChefHat className="w-30 h-30 text-white dark:text-black opacity-70" />
            </div>
            <Separator></Separator>
            <div className="flex justify-between gap-2 items-center">
               <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-muted-foreground">
                     <Users className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                     <span className="text-sm text-muted-foreground">
                        Servings:
                     </span>
                     <span className="font-semibold">{recipe.servings}</span>
                  </div>
               </div>
               <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-muted-foreground">
                     <Clock className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                     <span className="text-sm text-muted-foreground">
                        Cooking Time:
                     </span>
                     <span className="font-semibold">{recipe.cookingTime ?? "N/A"}</span>
                  </div>
               </div>
               <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-muted-foreground">
                     <Star className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                     <span className="text-sm text-muted-foreground">
                        Rating:
                     </span>
                     <span className="font-semibold">
                        {recipe.rating ?? 0}/100
                     </span>
                  </div>
               </div>
               <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-muted-foreground">
                     <ChefHat className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                     <span className="text-sm text-muted-foreground">
                        Cooked:
                     </span>
                     <span className="font-semibold">{(recipe as CookingHistoryResponse['recipe']).timesCooked ?? 0}</span>
                  </div>   
               </div>
            </div>
            <Separator></Separator>
            <div className="flex flex-col gap-6 ">
               <div className="flex items-center gap-2">
                  <InfoIcon className="w-5 h-5" />{" "}
                  <h2 className="text-xl font-semibold">
                     Nutrition Per Serving
                  </h2>
               </div>
               <NutritionDisplay
                  nutrition={calculateRecipeNutritionData(recipe)}
                  servings={recipe.servings}
                  showPerServing={true}
               />
            </div>
            <Separator></Separator>
            <div className="flex flex-col gap-2">
               <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
                  <span>Total Recipe Nutrition:</span>{" "}
                  <span className="font-semibold">
                     {Number(
                        calculateRecipeNutritionData(recipe).calories
                     ).toFixed(1)}
                     kcal
                  </span>
                  |
                  <span className="font-semibold">
                     {Number(
                        calculateRecipeNutritionData(recipe).protein
                     ).toFixed(1)}
                     g
                  </span>
                  |
                  <span className="font-semibold">
                     {Number(
                        calculateRecipeNutritionData(recipe).carbs
                     ).toFixed(1)}
                     g
                  </span>
                  |
                  <span className="font-semibold">
                     {Number(calculateRecipeNutritionData(recipe).fat).toFixed(
                        1
                     )}
                     g
                  </span>
               </div>
            </div>
            <Separator></Separator>
            <div className="flex flex-col gap-4">
               <h2 className="text-xl font-semibold">Ingredients</h2>
               <div className="flex flex-col gap-3">
                  {recipe.ingredients?.map((ingredient) => {
                     const nutrition = calculateRecipeNutritionData({
                        ingredients: [ingredient],
                     });
                     return (
                        <div
                           key={ingredient.id}
                           className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border">
                           <div className="flex flex-col gap-1">
                              <span className="font-semibold text-base">
                                 {ingredient.ingredient.name}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                 {Number(ingredient.quantityGrams).toFixed(0)}g
                                 • {Number(nutrition.calories).toFixed(0)}kcal •
                                 P: {Number(nutrition.protein).toFixed(1)}g • C:{" "}
                                 {Number(nutrition.carbs).toFixed(1)}g • F:{" "}
                                 {Number(nutrition.fat).toFixed(1)}g
                              </span>
                           </div>
                        </div>
                     );
                  })}
               </div>
            </div>

            <Separator />

            <div className="flex flex-col gap-4">
               <h2 className="text-xl font-semibold">Instructions</h2>
               <div className="flex flex-col gap-3">
                  {recipe.instructions ? (
                     recipe.instructions.split("\n").map(
                        (instruction, index) =>
                           instruction.trim() && (
                              <div key={index} className="flex gap-3">
                                 <span className="font-semibold text-primary min-w-[24px]">
                                    {index + 1}.
                                 </span>
                                 <span className="text-sm leading-relaxed">
                                    {instruction.trim()}
                                 </span>
                              </div>
                           )
                     )
                  ) : (
                     <p className="text-muted-foreground text-sm">
                        No instructions provided for this recipe.
                     </p>
                  )}
               </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between gap-3">
               <Button
                  onClick={handleCookedToday}
                  disabled={isPending}
                  className="bg-orange-500 hover:bg-orange-600 text-white flex items-center gap-2">
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronLeft className="w-4 h-4" />}
                  I Cooked This Today
               </Button>

               <div className="flex items-center gap-2">
                  <RecipeUpdateForm
                     recipe={recipe as RecipeResponse}
                     isOpen={isEditOpen}
                     onOpenChange={setIsEditOpen}
                     onSuccessDetailsCard={handleEditSuccess}>
                     <Button
                        variant="outline"
                        className="flex items-center gap-2">
                        <Edit className="w-4 h-4" />
                        Edit Recipe
                     </Button>
                  </RecipeUpdateForm>
               </div>
            </div>
         </DialogContent>
      </Dialog>
   );
}
