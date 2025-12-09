// components/meal-planner/DayCard.jsx
import React from "react";
import { motion } from "framer-motion";
import MealCard from "./MealCard";

export default function DayCard({ day, dayIndex, lang, onMealClick }) {
    const t = (ar, en) => (lang === "ar" ? ar : en);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: dayIndex * 0.1 }}
            className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl p-6 rounded-3xl border border-gray-700/50 hover:border-green-500/50 transition-all shadow-xl hover:shadow-2xl"
        >
            {/* Day Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-700/50">
                <h3 className="font-bold text-3xl bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
                    {day.day}
                </h3>
                <span className="px-4 py-2 bg-gradient-to-r from-purple-600/30 to-pink-600/30 rounded-full text-sm font-semibold border border-purple-500/30">
                    {t("اليوم", "Day")} {dayIndex + 1}
                </span>
            </div>

            {/* Meals Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {["breakfast", "lunch", "dinner"].map((slot) => {
                    const meal = day[slot];
                    if (!meal) return null;

                    return (
                        <MealCard
                            key={slot}
                            meal={meal}
                            slot={slot}
                            dayIndex={dayIndex}
                            lang={lang}
                            onMealClick={onMealClick}
                        />
                    );
                })}
            </div>
        </motion.div>
    );
}
