"use client";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { IngredientCreateForm } from "../forms/IngredientCreateForm";
import { Button } from "../ui/button";
import IngredientsContentClient from "./IngredientsContentClient";

function IngredientsLoading() {
   return (
      <div className="w-full flex items-center justify-center py-12">
         <Loader2 className="h-8 w-8 animate-spin" />
      </div>
   );
}

export default function IngredientsPageClient() {
   return (
      <div className="w-full mt-10 flex flex-col gap-8">
         <div className="flex flex-col md:flex-row w-full justify-between items-center">
            <div className="flex flex-col gap-2">
               <h1 className="text-3xl font-bold">Ingredients</h1>
            </div>
            <IngredientCreateForm>
               <Button>Add Ingredient</Button>
            </IngredientCreateForm>
         </div>
         <Suspense fallback={<IngredientsLoading />}>
            <IngredientsContentClient />
         </Suspense>
      </div>
   );
}
