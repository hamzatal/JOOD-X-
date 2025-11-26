import React, { forwardRef } from "react";
import { motion } from "framer-motion";
import { ClockIcon, UsersIcon, ChefHatIcon, SparklesIcon } from "lucide-react";

const RecipeCard = forwardRef(({ recipe, index, lang, onView }, ref) => {
    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -8 }}
            onClick={onView}
            className="relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all cursor-pointer"
        >
            <div className="relative h-40 overflow-hidden">
                <motion.img
                    src={recipe.image}
                    alt={recipe.title}
                    loading="lazy"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

                <div className="absolute top-2 left-2 px-2 py-1 rounded-full bg-green-500 text-white text-xs font-bold">
                    {recipe.difficulty === "easy"
                        ? lang === "ar"
                            ? "سهل"
                            : "Easy"
                        : recipe.difficulty === "medium"
                        ? lang === "ar"
                            ? "متوسط"
                            : "Medium"
                        : lang === "ar"
                        ? "صعب"
                        : "Hard"}
                </div>

                <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-red-500 text-white text-xs font-bold">
                    🔥 {recipe.calories}
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    className="absolute inset-0 bg-gradient-to-t from-green-600/95 to-transparent flex items-end justify-center pb-3"
                >
                    <div className="flex items-center gap-2 text-white">
                        <SparklesIcon size={18} />
                        <span className="font-semibold text-sm">
                            {lang === "ar"
                                ? "اضغط للتفاصيل"
                                : "Click for details"}
                        </span>
                    </div>
                </motion.div>
            </div>

            <div className="p-3">
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1 line-clamp-2">
                    {recipe.title}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                    {recipe.desc}
                </p>

                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-2 pb-2 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-1">
                        <ClockIcon size={14} />
                        <span>{recipe.time}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <UsersIcon size={14} />
                        <span>{recipe.servings}</span>
                    </div>
                    <ChefHatIcon size={14} />
                </div>

                <div className="flex flex-wrap gap-1">
                    <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs rounded-full font-semibold">
                        P: {recipe.protein}
                    </span>
                    <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 text-xs rounded-full font-semibold">
                        C: {recipe.carbs}
                    </span>
                    <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 text-xs rounded-full font-semibold">
                        F: {recipe.fat}
                    </span>
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                className="absolute inset-0 rounded-2xl ring-2 ring-green-500 pointer-events-none"
            />
        </motion.div>
    );
});

RecipeCard.displayName = "RecipeCard";

export default RecipeCard;
