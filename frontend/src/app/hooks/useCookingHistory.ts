import {
   useMutation,
   useQueryClient,
   useInfiniteQuery,
   useQuery,
   infiniteQueryOptions,
   queryOptions,
} from "@tanstack/react-query";
import {
   getCookingHistory,
   createCookingHistory,
   deleteCookingHistory,
   getCookingStats,
   getWeeklyNutrition,
} from "../services/cooking-history";
import { CookingHistoryQuery } from "../../../utils/schemas";
import { toast } from "sonner";

export const cookingHistoryQueryOptions = (
   filters: Partial<CookingHistoryQuery> = {}
) => {
   return infiniteQueryOptions({
      queryKey: ["cooking-history", filters],
      queryFn: ({ pageParam }) =>
         getCookingHistory({
            cursor: pageParam as string | undefined,
            limit: 10,
            ...filters,
         }),
      initialPageParam: undefined as string | undefined,
      getNextPageParam: (lastPage) => {
         return lastPage.nextCursor ?? undefined;
      },
      staleTime: 60 * 1000,
   });
};

export const recentCookingHistoryQueryOptions = () => {
   return queryOptions({
      queryKey: ["recent-cooking-history"],
      queryFn: () => getCookingHistory({ limit: 1 }),
      staleTime: 60 * 1000,
   });
};

export const useCookingHistory = (
   filters: Partial<CookingHistoryQuery> = {}
) => {
   return useInfiniteQuery(cookingHistoryQueryOptions(filters));
};

export const useRecentCookingHistory = () => {
   return useQuery({
      queryKey: ["recent-cooking-history"],
      queryFn: () => getCookingHistory({ limit: 1 }),
      staleTime: 60 * 1000,
   });
};

export const useCookingStats = () => {
   return useQuery({
      queryKey: ["cooking-stats"],
      queryFn: () => getCookingStats(),
      staleTime: 5 * 60 * 1000,
   });
};

export const useWeeklyNutrition = () => {
   return useQuery({
      queryKey: ["weekly-nutrition"],
      queryFn: () => getWeeklyNutrition(),
      staleTime: 5 * 60 * 1000,
   });
};

export const useCreateCookingHistory = () => {
   const queryClient = useQueryClient();
   return useMutation({
      mutationKey: ["createCookingHistory"],
      mutationFn: createCookingHistory,
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ["recipes"] });
         queryClient.invalidateQueries({ queryKey: ["cooking-history"] });
         queryClient.invalidateQueries({
            queryKey: ["recent-cooking-history"],
         });
         queryClient.invalidateQueries({ queryKey: ["cooking-stats"] });
         queryClient.invalidateQueries({ queryKey: ["weekly-nutrition"] });
         queryClient.invalidateQueries({ queryKey: ["dashboard"] }); // Invalidate dashboard when cooking history changes
         toast.success("Cooking history created successfully");
      },
      onError: (error) => {
         toast.error(
            error instanceof Error
               ? error.message
               : "Failed to create cooking history"
         );
      },
   });
};

export const useDeleteCookingHistory = () => {
   const queryClient = useQueryClient();
   return useMutation({
      mutationKey: ["deleteCookingHistory"],
      mutationFn: deleteCookingHistory,
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ["cooking-history"] });
         queryClient.invalidateQueries({
            queryKey: ["recent-cooking-history"],
         });
         queryClient.invalidateQueries({ queryKey: ["cooking-stats"] });
         queryClient.invalidateQueries({ queryKey: ["weekly-nutrition"] });
         queryClient.invalidateQueries({ queryKey: ["dashboard"] }); // Invalidate dashboard when cooking history changes
         toast.success("Cooking history deleted successfully");
      },
      onError: (error) => {
         toast.error(
            error instanceof Error
               ? error.message
               : "Failed to delete cooking history"
         );
      },
   });
};
