"use client";
import { QueryClientProvider } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/queryClient";

interface IQueryProviderProps {
   children: React.ReactNode;
}

export function QueryProvider({ children }: IQueryProviderProps) {
   const queryClient = getQueryClient();

   return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
   );
}
