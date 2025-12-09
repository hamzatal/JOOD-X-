import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { X, PieChart, TrendingUp, Activity } from "lucide-react";

export default function NutritionSummary({ plan, lang, onClose }) {
    const t = (ar, en) => (lang === "ar" ? ar : en);

    const nutritionData = useMemo(() => {
        let totalCalories = 0;
        let totalProtein = 0;
        let totalCarbs = 0;
        let totalFat = 0;
        const dailyBreakdown = [];

        plan.forEach((day) => {
            let dayCalories = 0;
            let dayProtein = 0;
            let dayCarbs = 0;
            let dayFat = 0;

            ["breakfast", "lunch", "dinner"].forEach((mealType) => {
                const meal = day[mealType];
                if (meal?.nutrition) {
                    dayCalories += meal.nutrition.calories;
                    dayProtein += meal.nutrition.protein;
                    dayCarbs += meal.nutrition.carbs;
                    dayFat += meal.nutrition.fat;
                }
            });

            totalCalories += dayCalories;
            totalProtein += dayProtein;
            totalCarbs += dayCarbs;
            totalFat += dayFat;

            dailyBreakdown.push({
                day: day.day,
                calories: dayCalories,
                protein: dayProtein,
                carbs: dayCarbs,
                fat: dayFat,
            });
        });

        const avgCalories =
            plan.length > 0 ? Math.round(totalCalories / plan.length) : 0;
        const avgProtein =
            plan.length > 0 ? Math.round(totalProtein / plan.length) : 0;

        return {
            totalCalories,
            totalProtein,
            totalCarbs,
            totalFat,
            avgCalories,
            avgProtein,
            dailyBreakdown,
        };
    }, [plan]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl border border-gray-700 shadow-2xl p-8 custom-scrollbar"
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl">
                            <PieChart size={28} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold">
                                {t("ملخص التغذية", "Nutrition Summary")}
                            </h2>
                            <p className="text-sm text-gray-400">
                                {t("للأسبوع الكامل", "For the entire week")}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 bg-red-600/90 hover:bg-red-700 rounded-full transition-all"
                    >
                        <X size={24} className="text-white" />
                    </button>
                </div>

                {/* Weekly Totals */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <NutritionCard
                        label={t("إجمالي السعرات", "Total Calories")}
                        value={nutritionData.totalCalories.toLocaleString()}
                        icon="🔥"
                        color="orange"
                    />
                    <NutritionCard
                        label={t("إجمالي البروتين", "Total Protein")}
                        value={`${nutritionData.totalProtein}g`}
                        icon="💪"
                        color="blue"
                    />
                    <NutritionCard
                        label={t("إجمالي الكارب", "Total Carbs")}
                        value={`${nutritionData.totalCarbs}g`}
                        icon="🌾"
                        color="green"
                    />
                    <NutritionCard
                        label={t("إجمالي الدهون", "Total Fat")}
                        value={`${nutritionData.totalFat}g`}
                        icon="🥑"
                        color="yellow"
                    />
                </div>

                {/* Daily Averages */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <div className="bg-gradient-to-br from-orange-900/40 to-red-900/40 backdrop-blur-lg p-6 rounded-2xl border border-orange-700/30">
                        <div className="flex items-center gap-3 mb-2">
                            <TrendingUp size={24} className="text-orange-400" />
                            <h3 className="text-lg font-bold">
                                {t(
                                    "متوسط السعرات اليومية",
                                    "Daily Avg Calories"
                                )}
                            </h3>
                        </div>
                        <p className="text-4xl font-bold text-white">
                            {nutritionData.avgCalories}
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                            {t("سعرة حرارية/يوم", "calories/day")}
                        </p>
                    </div>

                    <div className="bg-gradient-to-br from-blue-900/40 to-cyan-900/40 backdrop-blur-lg p-6 rounded-2xl border border-blue-700/30">
                        <div className="flex items-center gap-3 mb-2">
                            <Activity size={24} className="text-blue-400" />
                            <h3 className="text-lg font-bold">
                                {t(
                                    "متوسط البروتين اليومي",
                                    "Daily Avg Protein"
                                )}
                            </h3>
                        </div>
                        <p className="text-4xl font-bold text-white">
                            {nutritionData.avgProtein}g
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                            {t("جرام/يوم", "grams/day")}
                        </p>
                    </div>
                </div>

                {/* Daily Breakdown */}
                <div>
                    <h3 className="text-2xl font-bold mb-4">
                        {t("التفاصيل اليومية", "Daily Breakdown")}
                    </h3>
                    <div className="space-y-3">
                        {nutritionData.dailyBreakdown.map((day, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="bg-gray-800/50 p-5 rounded-xl border border-gray-700/50 hover:border-purple-500/50 transition-all"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="text-lg font-bold text-green-400">
                                        {day.day}
                                    </h4>
                                    <span className="text-sm text-gray-400">
                                        {t("اليوم", "Day")} {idx + 1}
                                    </span>
                                </div>
                                <div className="grid grid-cols-4 gap-3 text-sm">
                                    <div>
                                        <p className="text-gray-400 mb-1">
                                            {t("سعرات", "Calories")}
                                        </p>
                                        <p className="font-bold text-white">
                                            {day.calories}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400 mb-1">
                                            {t("بروتين", "Protein")}
                                        </p>
                                        <p className="font-bold text-white">
                                            {day.protein}g
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400 mb-1">
                                            {t("كارب", "Carbs")}
                                        </p>
                                        <p className="font-bold text-white">
                                            {day.carbs}g
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400 mb-1">
                                            {t("دهون", "Fat")}
                                        </p>
                                        <p className="font-bold text-white">
                                            {day.fat}g
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}

function NutritionCard({ label, value, icon, color }) {
    const colorMap = {
        orange: "from-orange-900/40 to-red-900/40 border-orange-700/30",
        blue: "from-blue-900/40 to-cyan-900/40 border-blue-700/30",
        green: "from-green-900/40 to-emerald-900/40 border-green-700/30",
        yellow: "from-yellow-900/40 to-amber-900/40 border-yellow-700/30",
    };

    return (
        <div
            className={`bg-gradient-to-br ${colorMap[color]} backdrop-blur-lg p-5 rounded-xl border text-center`}
        >
            <div className="text-3xl mb-2">{icon}</div>
            <p className="text-2xl font-bold text-white mb-1">{value}</p>
            <p className="text-xs text-gray-400">{label}</p>
        </div>
    );
}
