import { http, getErrorMessage } from "@/lib/http";
import {
  CreateIngredient,
  IngredientQuery,
  IngredientQuerySchema,
  IngredientResponse,
  IngredientResponseSchema,
  PaginatedIngredientsResponse,
  PaginatedIngredientsResponseSchema,
  UpdateIngredient,
} from "../../../utils/schemas";
import { ZodError } from "zod";

export const getIngredients = async (
  params: Partial<IngredientQuery> = {}
): Promise<PaginatedIngredientsResponse> => {
  try {
    const validatedParams = IngredientQuerySchema.partial().parse(params)
    const queryParams = new URLSearchParams()

    Object.entries(validatedParams).forEach(([key, value]) =>{
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, value.toString())
      }
    })
    
    const response = await http.get(`/ingredients?${queryParams.toString()}`)
    return PaginatedIngredientsResponseSchema.parse(response.data)
  } catch (error) {
    if (error instanceof ZodError) {
      throw new Error("Invalid ingredient query: " + error.message);
    }
    throw new Error(getErrorMessage(error));
  }
}



export const createIngredient = async (
  ingredient: CreateIngredient
): Promise<IngredientResponse> => {
  try {
    const response = await http.post("/ingredients", ingredient);
    return IngredientResponseSchema.parse(response.data);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new Error("Invalid ingredient data: " + error.message);
    }
    throw new Error(getErrorMessage(error));
  }
};

export const getIngredient = async (
  id: string
): Promise<IngredientResponse> => {
  try {
    const response = await http.get(`/ingredients/${id}`);
    return IngredientResponseSchema.parse(response.data);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new Error("Invalid ingredient data: " + error.message);
    }
    throw new Error(getErrorMessage(error));
  }
};

export const updateIngredient = async (
  id: string,
  ingredient: UpdateIngredient
): Promise<IngredientResponse> => {
  try {
    const response = await http.patch(`ingredients/${id}`, ingredient);
    return IngredientResponseSchema.parse(response.data);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new Error("Invalid ingredient data: " + error.message);
    }
    throw new Error(getErrorMessage(error));
  }
};

export const deleteIngredient = async (
  id: string
 ): Promise<void> => {
  try {
    await http.delete(`/ingredients/${id}`);
    return;
  } catch (error) {
    if (error instanceof ZodError) {
      throw new Error("Invalid ingredient data: " + error.message);
    }
    throw new Error(getErrorMessage(error));
  }
};
