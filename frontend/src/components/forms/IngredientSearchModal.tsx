"use client";
import { useState } from "react";
import { Loader2, Search, X } from "lucide-react";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useIngredients } from "@/app/hooks/useIngredients";
import { useRouter } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { Label } from "@/components/ui/label";


export function IngredientSearchModal({ children }: { children: React.ReactNode }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedIngredients, setSelectedIngredients] = useState<{id: string, name: string}[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [inputValue, setInputValue] = useState("");
  const router = useRouter();

  const debouncedSearch = useDebouncedCallback((value: string) => {
    setSearchTerm(value);
  }, 500);

  const { data: ingredientsData, isFetching } = useIngredients({
    search: searchTerm,
    limit: 50,
  });

  const filteredIngredients = ingredientsData?.pages.flatMap(
    (page) => page.data
  ) || [];

  const handleAddIngredient = (ingredient: {id: string, name: string}) => {
    if (!selectedIngredients.find(ing => ing.id === ingredient.id)) {
      setSelectedIngredients(prev => [...prev, ingredient]);
    }
    setInputValue("");
    setSearchTerm("");
  };

  const handleRemoveIngredient = (id: string) => {
    setSelectedIngredients(prev => prev.filter(ing => ing.id !== id));
  };

  const handleSearch = () => {
    const ingredientIds = selectedIngredients.map(ing => ing.id).join(',');
    router.push(`/recipes?ingredients=${ingredientIds}`);
    setIsDialogOpen(false);
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Search Recipes by Ingredients</DialogTitle>
          <DialogDescription>
            Select ingredients to find recipes that use them
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <Label>Selected Ingredients ({selectedIngredients.length})</Label>
          {selectedIngredients.length > 0 ? (
            <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-[50px]">
              {selectedIngredients.map(ing => (
                <div key={ing.id} className="inline-flex items-center gap-1 px-3 py-1 bg-primary text-primary-foreground rounded-full text-sm">
                  <span>{ing.name}</span>
                  <button 
                    onClick={() => handleRemoveIngredient(ing.id)}
                    className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 border rounded-md text-center text-muted-foreground">
              No ingredients selected
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label>Search Ingredients</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                debouncedSearch(e.target.value);
              }}
              placeholder="Type to search ingredients..."
              className="pl-9"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Available Ingredients</Label>
          <div className="border rounded-md max-h-[200px] overflow-y-auto">
            {filteredIngredients.length > 0 ? (
              filteredIngredients
                .filter(ing => !selectedIngredients.find(sel => sel.id === ing.id))
                .map(ingredient => (
                  <button
                    key={ingredient.id}
                    onClick={() => handleAddIngredient({id: ingredient.id!, name: ingredient.name})}
                    className="w-full text-left px-4 py-2 hover:bg-muted transition-colors"
                  >
                    <div className="font-medium">{ingredient.name}</div>
                    {ingredient.category && (
                      <div className="text-sm text-muted-foreground">{ingredient.category}</div>
                    )}
                  </button>
                ))
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                {isFetching ? (
                  <span className="text-muted-foreground flex items-center gap-2 justify-center py-4">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Searching...
                  </span>
                ) : (
                  <span className="text-muted-foreground flex items-center gap-2 justify-center py-4">
                    <Search className="h-4 w-4 mr-2" />
                    No ingredients found
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSearch}
            disabled={selectedIngredients.length === 0}
          >
            {isFetching ? "Searching..." : "Search Recipes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}