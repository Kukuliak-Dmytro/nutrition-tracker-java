import {
   useInfiniteQuery,
   useMutation,
   useQueryClient,
   infiniteQueryOptions,
} from "@tanstack/react-query";
import {
   getIngredients,
   createIngredient,
   updateIngredient,
   deleteIngredient,
} from "@/app/services/ingredients";
import { toast } from "sonner";
import { UpdateIngredient, IngredientQuery } from "../../../utils/schemas";

export const ingredientsQueryOptions = (
   filters: Partial<IngredientQuery> = {}
) => {
   return infiniteQueryOptions({
      queryKey: ["ingredients", filters],
      queryFn: ({ pageParam }) =>
         getIngredients({
            cursor: pageParam as string | undefined,
            limit: 50,
            ...filters,
         }),
      initialPageParam: undefined as string | undefined,
      getNextPageParam: (lastPage) => {
         return lastPage.nextCursor ?? undefined;
      },
      staleTime: 60 * 1000,
   });
};

export const useIngredients = (filters: Partial<IngredientQuery> = {}) => {
   return useInfiniteQuery(ingredientsQueryOptions(filters));
};

export const useCreateIngredient = () => {
   const queryClient = useQueryClient();
   return useMutation({
      mutationKey: ["createIngredient"],
      mutationFn: createIngredient,
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ["ingredients"] });
      },
      onError: (error) => {
         toast.error(
            error instanceof Error
               ? error.message
               : "Failed to create ingredient"
         );
      },
   });
};

export const useUpdateIngredient = () => {
   const queryClient = useQueryClient();
   return useMutation({
      mutationKey: ["updateIngredient"],
      mutationFn: ({
         id,
         ingredient,
      }: {
         id: string;
         ingredient: UpdateIngredient;
      }) => updateIngredient(id, ingredient),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ["ingredients"] });
      },
      onError: (error) => {
         toast.error(
            error instanceof Error
               ? error.message
               : "Failed to update ingredient"
         );
      },
   });
};

export const useDeleteIngredient = () => {
   const queryClient = useQueryClient();
   return useMutation({
      mutationKey: ["deleteIngredient"],
      mutationFn: deleteIngredient,
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ["ingredients"] });
      },
      onError: (error) => {
         toast.error(
            error instanceof Error
               ? error.message
               : "Failed to delete ingredient"
         );
      },
   });
};
