// components/meal-planner/WeeklyStats.jsx
import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Flame, TrendingUp, Award, DollarSign } from "lucide-react";

export default function WeeklyStats({ plan, lang }) {
    const t = (ar, en) => (lang === "ar" ? ar : en);

    const stats = useMemo(() => {
        let totalCalories = 0;
        let totalProtein = 0;
        let totalCarbs = 0;
        let totalFat = 0;
        let totalCost = 0;
        let mealCount = 0;

        plan.forEach((day) => {
            ["breakfast", "lunch", "dinner"].forEach((mealType) => {
                const meal = day[mealType];
                if (meal?.nutrition) {
                    totalCalories += meal.nutrition.calories;
                    totalProtein += meal.nutrition.protein;
                    totalCarbs += meal.nutrition.carbs;
                    totalFat += meal.nutrition.fat;
                    totalCost += meal.cost || 0;
                    mealCount++;
                }
            });
        });

        return {
            totalCalories,
            avgProtein:
                mealCount > 0 ? Math.round(totalProtein / mealCount) : 0,
            totalMeals: mealCount,
            totalCost: totalCost.toFixed(2),
            avgCalories:
                mealCount > 0 ? Math.round(totalCalories / mealCount) : 0,
        };
    }, [plan]);

    return (
        <section className="py-8 px-4 -mt-8">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    <StatCard
                        icon={Flame}
                        label={t("إجمالي السعرات", "Total Calories")}
                        value={stats.totalCalories.toLocaleString()}
                        subtitle={t("لمدة أسبوع", "Per Week")}
                        gradient="from-orange-900/40 to-red-900/40"
                        borderColor="border-orange-700/30"
                        iconColor="text-orange-400"
                        iconBg="bg-orange-500/20"
                        delay={0.1}
                    />

                    <StatCard
                        icon={TrendingUp}
                        label={t("متوسط البروتين", "Avg Protein")}
                        value={`${stats.avgProtein}g`}
                        subtitle={t("لكل وجبة", "Per Meal")}
                        gradient="from-blue-900/40 to-cyan-900/40"
                        borderColor="border-blue-700/30"
                        iconColor="text-blue-400"
                        iconBg="bg-blue-500/20"
                        delay={0.2}
                    />

                    <StatCard
                        icon={Award}
                        label={t("الوجبات المخططة", "Planned Meals")}
                        value={stats.totalMeals}
                        subtitle={t("7 أيام × 3 وجبات", "7 Days × 3 Meals")}
                        gradient="from-green-900/40 to-emerald-900/40"
                        borderColor="border-green-700/30"
                        iconColor="text-green-400"
                        iconBg="bg-green-500/20"
                        delay={0.3}
                    />

                    <StatCard
                        icon={DollarSign}
                        label={t("التكلفة الإجمالية", "Total Cost")}
                        value={`${stats.totalCost}`}
                        subtitle={t("دينار أردني", "JOD")}
                        gradient="from-purple-900/40 to-pink-900/40"
                        borderColor="border-purple-700/30"
                        iconColor="text-purple-400"
                        iconBg="bg-purple-500/20"
                        delay={0.4}
                    />
                </div>
            </div>
        </section>
    );
}

function StatCard({
    icon: Icon,
    label,
    value,
    subtitle,
    gradient,
    borderColor,
    iconColor,
    iconBg,
    delay,
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className={`bg-gradient-to-br ${gradient} backdrop-blur-lg p-6 rounded-2xl border ${borderColor} shadow-xl hover:shadow-2xl transition-all`}
        >
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm mb-1 font-medium text-gray-300">
                        {label}
                    </p>
                    <p className="text-4xl font-bold text-white">{value}</p>
                    <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
                </div>
                <div className={`p-4 ${iconBg} rounded-2xl`}>
                    <Icon size={40} className={iconColor} />
                </div>
            </div>
        </motion.div>
    );
}
