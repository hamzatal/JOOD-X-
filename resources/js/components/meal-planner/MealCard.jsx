// components/meal-planner/MealCard.jsx
import React from "react";
import { motion } from "framer-motion";
import { Flame, Clock, DollarSign } from "lucide-react";

const PLACEHOLDER_IMAGE =
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop";

export default function MealCard({ meal, slot, dayIndex, lang, onMealClick }) {
    const t = (ar, en) => (lang === "ar" ? ar : en);

    const title = meal.name || meal.strMeal || "Meal";
    const image = meal.image || meal.strMealThumb || PLACEHOLDER_IMAGE;

    const getMealIcon = (slot) => {
        const icons = { breakfast: "☀️", lunch: "🍽️", dinner: "🌙" };
        return icons[slot] || "🍴";
    };

    const getMealLabel = (slot) => {
        const labels = {
            breakfast: t("إفطار", "Breakfast"),
            lunch: t("غداء", "Lunch"),
            dinner: t("عشاء", "Dinner"),
        };
        return labels[slot] || slot;
    };

    const handleImageError = (e) => {
        e.target.onerror = null;
        e.target.src = PLACEHOLDER_IMAGE;
    };

    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            className="group relative flex flex-col bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-700/50 hover:border-green-500/70 transition-all cursor-pointer overflow-hidden shadow-lg hover:shadow-xl"
            onClick={() => onMealClick(meal)}
        >
            {/* Hover Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 via-green-500/10 to-green-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>

            {/* Image Section */}
            <div className="relative h-48 overflow-hidden">
                <img
                    src={image}
                    alt={title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={handleImageError}
                    loading="lazy"
                />

                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent"></div>

                {/* Meal Type Badge */}
                <div className="absolute top-3 left-3 px-3 py-1.5 bg-gray-900/90 backdrop-blur-sm rounded-full border border-gray-700 flex items-center gap-2">
                    <span className="text-xl">{getMealIcon(slot)}</span>
                    <span className="text-xs font-semibold text-white">
                        {getMealLabel(slot)}
                    </span>
                </div>

                {/* Title Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h4 className="text-lg font-bold text-white line-clamp-2">
                        {title}
                    </h4>
                </div>
            </div>

            {/* Info Section */}
            {meal.nutrition && (
                <div className="p-4 space-y-3">
                    {/* Nutrition Grid */}
                    <div className="grid grid-cols-4 gap-2 text-xs">
                        <div className="bg-orange-900/30 p-2 rounded-lg border border-orange-700/30 text-center">
                            <Flame
                                size={14}
                                className="mx-auto text-orange-400 mb-1"
                            />
                            <div className="font-bold text-white">
                                {meal.nutrition.calories}
                            </div>
                            <div className="text-orange-300/70 text-[10px]">
                                {t("سعرة", "cal")}
                            </div>
                        </div>
                        <div className="bg-blue-900/30 p-2 rounded-lg border border-blue-700/30 text-center">
                            <div className="font-bold text-white">
                                {meal.nutrition.protein}g
                            </div>
                            <div className="text-blue-300/70 text-[10px]">
                                {t("بروتين", "protein")}
                            </div>
                        </div>
                        <div className="bg-green-900/30 p-2 rounded-lg border border-green-700/30 text-center">
                            <div className="font-bold text-white">
                                {meal.nutrition.carbs}g
                            </div>
                            <div className="text-green-300/70 text-[10px]">
                                {t("كارب", "carbs")}
                            </div>
                        </div>
                        <div className="bg-yellow-900/30 p-2 rounded-lg border border-yellow-700/30 text-center">
                            <div className="font-bold text-white">
                                {meal.nutrition.fat}g
                            </div>
                            <div className="text-yellow-300/70 text-[10px]">
                                {t("دهون", "fat")}
                            </div>
                        </div>
                    </div>

                    {/* Additional Info */}
                    <div className="flex items-center justify-between text-xs text-gray-400">
                        <div className="flex items-center gap-1">
                            <Clock size={14} />
                            <span>
                                {meal.prepTime || 30} {t("دقيقة", "min")}
                            </span>
                        </div>
                        {meal.cost && (
                            <div className="flex items-center gap-1">
                                <DollarSign size={14} />
                                <span>
                                    {meal.cost} {t("د.أ", "JOD")}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </motion.div>
    );
}
