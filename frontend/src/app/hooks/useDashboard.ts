import { queryOptions, useQuery } from "@tanstack/react-query";
import { getDashboardData } from "../services/dashboard";

export const dashboardQueryOptions = () => {
  return queryOptions({
    queryKey: ["dashboard"],
    queryFn: () => getDashboardData(),
    staleTime: 60 * 1000,
  })
}

export const useDashboard = () => {
  return useQuery(dashboardQueryOptions());
};

