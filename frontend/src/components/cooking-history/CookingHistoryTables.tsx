import {
   Heart,
   CalendarDays,
   Clock,
   Trash2,
   Eye,
   Loader2,
   ChefHat,
   ChevronLeft,
   ChevronRight,
} from "lucide-react";
import {
   Table,
   TableCell,
   TableHead,
   TableBody,
   TableHeader,
   TableRow,
} from "../ui/table";
import { useCookingHistory } from "@/app/hooks/useCookingHistory";
import { format } from "date-fns";
import { Button } from "../ui/button";
import CookingHistoryDelete from "@/components/forms/CookingHistoryDelete";
import { useState } from "react";
import { calculateRecipeNutritionData } from "../../../utils/calculations/nutrition";
import { Link } from "@/i18n/routing";

interface CookingHistoryTablesProps {
   searchTerm: string;
   startDate: Date | undefined;
   endDate: Date | undefined;
}

export default function CookingHistoryTables({
   searchTerm,
   startDate,
   endDate,
}: CookingHistoryTablesProps) {
   const [page, setPage] = useState(0);
   const {
      data: cookingHistory,
      isLoading,
      isError,
      refetch,
   } = useCookingHistory({
      search: searchTerm,
      startDate,
      endDate,
      page,
   });

   const hasMore = cookingHistory?.hasMore || false;
   const totalCount = cookingHistory?.totalCooks || 0;
   const data = cookingHistory?.data || [];

   return (
      <div className="border border-border rounded-xl overflow-hidden shadow-sm bg-white dark:bg-gray-950">
         <Table>
            <TableHeader>
               <TableRow className="bg-gray-50/80 dark:bg-gray-900/50 hover:bg-gray-50/80 dark:hover:bg-gray-900/50 border-b-2 border-gray-200 dark:border-gray-800 h-16">
                  <TableHead className="text-lg font-semibold">
                     Recipe
                  </TableHead>
                  <TableHead className="text-lg font-semibold">
                     Nutrition
                  </TableHead>
                  <TableHead className="text-lg font-semibold">
                     Date & Time
                  </TableHead>
                  <TableHead className="text-lg font-semibold">
                     Times Cooked
                  </TableHead>
                  <TableHead className="text-lg font-semibold text-right">
                     Actions
                  </TableHead>
               </TableRow>
            </TableHeader>
            <TableBody>
               {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                     <TableRow key={`skeleton-${i}`}>
                        <TableCell colSpan={5} className="py-8 text-center">
                           <div className="flex justify-center items-center gap-3">
                              <Loader2 className="w-5 h-5 animate-spin text-primary" />
                              <span className="text-muted-foreground">Loading...</span>
                           </div>
                        </TableCell>
                     </TableRow>
                  ))
               ) : isError ? (
                  <TableRow>
                     <TableCell colSpan={5} className="py-20">
                        <div className="flex justify-center items-center">
                           <div className="text-center flex flex-col gap-4">
                              <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                                 Error loading cooking history
                              </p>
                              <p className="text-base text-muted-foreground">
                                 Please try again later
                              </p>
                              <Button
                                 onClick={() => refetch()}
                                 variant="outline"
                                 size="sm"
                              >
                                 Retry
                              </Button>
                           </div>
                        </div>
                     </TableCell>
                  </TableRow>
               ) : data.length === 0 ? (
                  <TableRow>
                     <TableCell colSpan={5} className="py-20">
                        <div className="flex justify-center items-center">
                           <div className="text-center flex flex-col items-center gap-3">
                              <ChefHat className="w-12 h-12 text-muted-foreground" />
                              <p className="text-lg font-semibold text-muted-foreground">
                                 No cooking history yet
                              </p>
                              <p className="text-base text-muted-foreground">
                                 Cook something to see your history!
                              </p>
                           </div>
                        </div>
                     </TableCell>
                  </TableRow>
               ) : (
                  data.map((cookingHistory) => {
                     const recipeNutritionData =
                        calculateRecipeNutritionData(cookingHistory.recipe);
                     return (
                        <TableRow
                           key={cookingHistory.id}
                           className="hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition-colors">
                           <TableCell className="py-6 max-w-xs">
                              <div className="flex flex-col gap-1.5">
                                 <div className="flex items-center gap-2">
                                    <h3 className="text-xl font-semibold text-foreground truncate">
                                       {cookingHistory.recipe.name}
                                    </h3>
                                    {cookingHistory.recipe.isFavorite && (
                                       <Heart className="w-5 h-5 text-red-500 fill-current flex-shrink-0" />
                                    )}
                                 </div>
                                 <p className="text-base text-muted-foreground line-clamp-2 leading-relaxed">
                                    {cookingHistory.recipe.description}
                                 </p>
                              </div>
                           </TableCell>

                           <TableCell className="py-6">
                              <div className="flex flex-col gap-2">
                                 <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 font-semibold text-sm">
                                       {Number(
                                          recipeNutritionData.calories
                                       ).toFixed(1)}{" "}
                                       kcal
                                    </span>
                                    <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 font-semibold text-sm">
                                       {Number(
                                          recipeNutritionData.protein
                                       ).toFixed(1)}
                                       g
                                    </span>
                                 </div>
                                 <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 font-semibold text-sm">
                                       {Number(
                                          recipeNutritionData.carbs
                                       ).toFixed(1)}
                                       g
                                    </span>
                                    <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 font-semibold text-sm">
                                       {Number(
                                          recipeNutritionData.fat
                                       ).toFixed(1)}
                                       g
                                    </span>
                                 </div>
                              </div>
                           </TableCell>

                           <TableCell className="py-6">
                              <div className="flex flex-col gap-1.5">
                                 <div className="flex items-center gap-2 text-base font-medium">
                                    <CalendarDays className="w-5 h-5 text-muted-foreground" />
                                    {format(
                                       cookingHistory.cookedAt,
                                       "MM/dd/yyyy"
                                    )}
                                 </div>
                                 <div className="flex items-center gap-2 text-base text-muted-foreground">
                                    <Clock className="w-5 h-5" />
                                    {format(
                                       cookingHistory.cookedAt,
                                       "HH:mm"
                                    )}
                                 </div>
                              </div>
                           </TableCell>

                           <TableCell className="py-6">
                              <div className="flex items-center gap-2">
                                 <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-yellow-50 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400 font-semibold text-sm">
                                    {cookingHistory.recipe.timesCooked || 0}{" "}
                                    times
                                 </span>
                              </div>
                           </TableCell>

                           <TableCell className="py-6">
                              <div className="flex items-center justify-end gap-2">
                                 <Link href={`/recipes/${cookingHistory.recipe.id}`} prefetch={true}>
                                    <Button
                                       variant="ghost"
                                       size="icon"
                                       className="h-12 w-12 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors">
                                       <Eye className="size-6" />
                                    </Button>
                                 </Link>
                                 <CookingHistoryDelete
                                    cookingHistory={cookingHistory}>
                                    <Button
                                       variant="ghost"
                                       size="icon"
                                       className="h-10 w-10 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                                       <Trash2 className="size-5" />
                                    </Button>
                                 </CookingHistoryDelete>
                              </div>
                           </TableCell>
                        </TableRow>
                     );
                  })
               )}
            </TableBody>
         </Table>
         <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-gray-50/50 dark:bg-gray-900/30">
            <div className="text-sm text-muted-foreground">
               Showing Page {page + 1} ({totalCount} total results)
            </div>
            <div className="flex items-center gap-2">
               <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0 || isLoading}>
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
               </Button>
               <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!hasMore || isLoading}>
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
               </Button>
            </div>
         </div>
      </div>
   );
}
