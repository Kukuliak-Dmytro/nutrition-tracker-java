"use client";
import CookingHistory from "@/components/dashboard/RecentCookingHistory";
import HeroSection from "@/components/dashboard/HeroSection";
import QuickActions from "@/components/dashboard/QuickActions";
import RecentRecipes from "@/components/dashboard/RecentRecipes";
import WeekNutrition from "@/components/dashboard/WeekNutrition";
import { useDashboard } from "@/app/hooks/useDashboard";

export default function DashboardClient() {
  const { isError, error } = useDashboard();

  if (isError) {
    console.error("Dashboard Hook Error:", error);
  }

  return (
    <div className="flex flex-col w-full gap-10 mt-10">
      <HeroSection />
      {isError && (
        <div className="bg-red-500 text-white p-4 rounded-md mb-4 whitespace-pre-wrap">
          <p className="font-bold">Dashboard Error Details:</p>
          {error?.message || String(error)}
        </div>
      )}
      <QuickActions />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-stretch">
        <div className="order-2 sm:order-1 flex">
          <RecentRecipes />
        </div>
        <div className="order-1 sm:order-2 flex">
          <WeekNutrition />
        </div>
      </div>
      <CookingHistory />
    </div>
  );
}
