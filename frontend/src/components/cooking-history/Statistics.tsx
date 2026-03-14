import { Calendar, TrendingUp, BarChart3 } from "lucide-react"
import { useCookingStats } from "@/app/hooks/useCookingHistory";

export default function Statistics() {
    const { data: cookingStats } = useCookingStats();
    const weeklyAverage = cookingStats?.weeklyAverage || 0;
    const currentStreak = cookingStats?.currentStreak || 0;
    const mostCookedRecipe = cookingStats?.mostCookedRecipe || null;

    return (
        <div className="w-full flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
                {/* Most Cooked Recipe Card */}
                <div className="group relative bg-gradient-to-br from-blue-50 via-blue-50 to-blue-100 dark:from-blue-950/40 dark:via-blue-950/30 dark:to-blue-900/40 rounded-2xl p-6 border border-blue-200/60 dark:border-blue-800/60 flex flex-col justify-between min-h-[140px] shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-blue-200/20 dark:bg-blue-800/20 rounded-full -translate-y-10 translate-x-10"></div>
                    <div className="absolute bottom-0 left-0 w-16 h-16 bg-blue-300/20 dark:bg-blue-700/20 rounded-full translate-y-8 -translate-x-8"></div>
                    
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                                <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">Most Cooked</h3>
                        </div>
                        <div className="space-y-2">
                            <div className="text-2xl font-bold text-blue-800 dark:text-blue-200 truncate">
                                {mostCookedRecipe?.name || "No recipes yet"}
                            </div>
                            <div className="text-base text-blue-600 dark:text-blue-400 font-medium">
                                {mostCookedRecipe ? `${mostCookedRecipe.count} times` : "Start cooking!"}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Weekly Average Card */}
                <div className="group relative bg-gradient-to-br from-emerald-50 via-emerald-50 to-emerald-100 dark:from-emerald-950/40 dark:via-emerald-950/30 dark:to-emerald-900/40 rounded-2xl p-6 border border-emerald-200/60 dark:border-emerald-800/60 flex flex-col justify-between min-h-[140px] shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-200/20 dark:bg-emerald-800/20 rounded-full -translate-y-10 translate-x-10"></div>
                    <div className="absolute bottom-0 left-0 w-16 h-16 bg-emerald-300/20 dark:bg-emerald-700/20 rounded-full translate-y-8 -translate-x-8"></div>
                    
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg">
                                <BarChart3 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-100">Weekly Average</h3>
                        </div>
                        <div className="space-y-2">
                            <div className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">
                                {weeklyAverage.toFixed(1)}
                            </div>
                            <div className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                                meals per week
                            </div>
                        </div>
                    </div>
                </div>

                {/* Current Streak Card */}
                <div className="group relative bg-gradient-to-br from-orange-50 via-orange-50 to-orange-100 dark:from-orange-950/40 dark:via-orange-950/30 dark:to-orange-900/40 rounded-2xl p-6 border border-orange-200/60 dark:border-orange-800/60 flex flex-col justify-between min-h-[140px] shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-orange-200/20 dark:bg-orange-800/20 rounded-full -translate-y-10 translate-x-10"></div>
                    <div className="absolute bottom-0 left-0 w-16 h-16 bg-orange-300/20 dark:bg-orange-700/20 rounded-full translate-y-8 -translate-x-8"></div>
                    
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-lg">
                                <Calendar className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100">Current Streak</h3>
                        </div>
                        <div className="space-y-2">
                            <div className="text-3xl font-bold text-orange-700 dark:text-orange-300">
                                {currentStreak}
                            </div>
                            <div className="text-sm text-orange-600 dark:text-orange-400 font-medium">
                                {currentStreak > 0 ? "Keep it up!" : "Start your streak!"}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}