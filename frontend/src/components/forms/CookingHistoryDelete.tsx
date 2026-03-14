import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogHeader,
   DialogTitle,
   DialogTrigger,
} from "@/components/ui/dialog";
import { useDeleteCookingHistory } from "@/app/hooks/useCookingHistory";
import { CookingHistoryResponse } from "../../../utils/schemas";
import { format } from "date-fns";

interface CookingHistoryDeleteProps {
   children: React.ReactNode;
   cookingHistory: CookingHistoryResponse;
}

export default function CookingHistoryDelete({
   children,
   cookingHistory,
}: CookingHistoryDeleteProps) {
   const [isOpen, setIsOpen] = useState(false);
   const [isDeleting, setIsDeleting] = useState(false);
   const { mutate: deleteCookingHistory } = useDeleteCookingHistory();

   const onDelete = () => {
      setIsDeleting(true);
      deleteCookingHistory(cookingHistory.id!, {});
   };

   return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
         <DialogTrigger asChild>{children}</DialogTrigger>
         <DialogContent className="sm:max-w-md">
            <DialogHeader className="text-center">
               <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Delete Cooking History
               </DialogTitle>
               <DialogDescription className="text-gray-600 dark:text-gray-400 mt-2">
                  Are you sure you want to delete the cooking history for{" "}
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                     &quot;{cookingHistory.recipe.name}&quot;
                  </span>
                  <br />
                  on the{" "}
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                     {format(cookingHistory.cookedAt, "dd MMM yyyy")}
                  </span>
                  ?
                  <br />
                  <span className="text-sm text-red-600 dark:text-red-400 mt-1 block">
                     This action cannot be undone.
                  </span>
               </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col-reverse sm:flex-row gap-3 mt-6">
               <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  disabled={isDeleting}
                  className="flex-1 sm:flex-none">
                  Cancel
               </Button>
               <Button
                  type="button"
                  variant="destructive"
                  onClick={onDelete}
                  disabled={isDeleting}
                  className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 focus:ring-red-500">
                  {isDeleting ? (
                     <>
                        <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Deleting...
                     </>
                  ) : (
                     <>Delete</>
                  )}
               </Button>
            </div>
         </DialogContent>
      </Dialog>
   );
}
