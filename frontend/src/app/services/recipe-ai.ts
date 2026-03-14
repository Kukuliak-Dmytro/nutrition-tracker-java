import {
   GenerateRecipe,
   GenerateRecipeResponse,
   GenerateRecipeResponseSchema,
} from "../../../utils/schemas/recipe";
import { getErrorMessage, http } from "@/lib/http";
import { ZodError } from "zod";

export async function generateRecipeContent(
   payload: GenerateRecipe
): Promise<GenerateRecipeResponse> {
   try {
      const { data } = await http.post<GenerateRecipeResponse>(
         "/ai/generate-recipe",
         payload
      );
      return GenerateRecipeResponseSchema.parse(data);
   } catch (error) {
      if (error instanceof ZodError) {
         throw new Error("Invalid recipe data: " + error.message);
      }
      throw new Error(getErrorMessage(error));
   }
}
