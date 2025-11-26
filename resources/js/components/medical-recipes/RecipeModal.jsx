import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    XIcon,
    ClockIcon,
    UsersIcon,
    FlameIcon,
    PrinterIcon,
    CheckCircleIcon,
} from "lucide-react";

export default function RecipeModal({ recipe, isOpen, onClose, lang }) {
    const [activeTab, setActiveTab] = useState("ingredients");

    if (!recipe) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    >
                        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden">
                            <div className="relative h-48">
                                <img
                                    src={recipe.image}
                                    alt={recipe.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

                                <button
                                    onClick={onClose}
                                    className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white rounded-full transition shadow-lg"
                                >
                                    <XIcon size={20} />
                                </button>

                                <button
                                    onClick={() => window.print()}
                                    className="absolute top-3 left-3 p-2 bg-white/90 hover:bg-white rounded-full transition shadow-lg"
                                >
                                    <PrinterIcon size={18} />
                                </button>

                                <div className="absolute bottom-4 left-4 right-4">
                                    <h2 className="text-2xl font-bold text-white mb-2">
                                        {recipe.title}
                                    </h2>
                                    <div className="flex flex-wrap items-center gap-2 text-white text-sm">
                                        <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full flex items-center gap-1">
                                            <ClockIcon size={14} />
                                            {recipe.time}
                                        </span>
                                        <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full flex items-center gap-1">
                                            <UsersIcon size={14} />
                                            {recipe.servings}
                                        </span>
                                        <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full flex items-center gap-1">
                                            <FlameIcon size={14} />
                                            {recipe.calories} cal
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="overflow-y-auto max-h-[calc(85vh-12rem)] p-6">
                                <div className="grid grid-cols-4 gap-3 mb-6">
                                    <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-3 text-center">
                                        <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                                            {recipe.calories}
                                        </div>
                                        <div className="text-xs text-gray-600 dark:text-gray-400">
                                            {lang === "ar" ? "سعرة" : "Cal"}
                                        </div>
                                    </div>
                                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 text-center">
                                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                            {recipe.protein}
                                        </div>
                                        <div className="text-xs text-gray-600 dark:text-gray-400">
                                            {lang === "ar"
                                                ? "بروتين"
                                                : "Protein"}
                                        </div>
                                    </div>
                                    <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 text-center">
                                        <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                                            {recipe.carbs}
                                        </div>
                                        <div className="text-xs text-gray-600 dark:text-gray-400">
                                            {lang === "ar"
                                                ? "كربوهيدرات"
                                                : "Carbs"}
                                        </div>
                                    </div>
                                    <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-3 text-center">
                                        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                            {recipe.fat}
                                        </div>
                                        <div className="text-xs text-gray-600 dark:text-gray-400">
                                            {lang === "ar" ? "دهون" : "Fat"}
                                        </div>
                                    </div>
                                </div>

                                {recipe.benefits && (
                                    <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 mb-6">
                                        <div className="flex items-start gap-2">
                                            <CheckCircleIcon
                                                size={20}
                                                className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5"
                                            />
                                            <div>
                                                <h4 className="font-bold text-green-800 dark:text-green-300 mb-1">
                                                    {lang === "ar"
                                                        ? "الفوائد الطبية"
                                                        : "Medical Benefits"}
                                                </h4>
                                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                                    {recipe.benefits}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-2 border-b-2 border-gray-200 dark:border-gray-700 mb-4">
                                    <button
                                        onClick={() =>
                                            setActiveTab("ingredients")
                                        }
                                        className={`px-4 py-2 font-semibold transition relative ${
                                            activeTab === "ingredients"
                                                ? "text-green-600 dark:text-green-400"
                                                : "text-gray-500"
                                        }`}
                                    >
                                        {lang === "ar"
                                            ? "المكونات"
                                            : "Ingredients"}
                                        {activeTab === "ingredients" && (
                                            <motion.div
                                                layoutId="activeTab"
                                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600"
                                            />
                                        )}
                                    </button>
                                    <button
                                        onClick={() =>
                                            setActiveTab("instructions")
                                        }
                                        className={`px-4 py-2 font-semibold transition relative ${
                                            activeTab === "instructions"
                                                ? "text-green-600 dark:text-green-400"
                                                : "text-gray-500"
                                        }`}
                                    >
                                        {lang === "ar"
                                            ? "التحضير"
                                            : "Instructions"}
                                        {activeTab === "instructions" && (
                                            <motion.div
                                                layoutId="activeTab"
                                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600"
                                            />
                                        )}
                                    </button>
                                </div>

                                <AnimatePresence mode="wait">
                                    {activeTab === "ingredients" && (
                                        <motion.div
                                            key="ingredients"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="space-y-2"
                                        >
                                            {recipe.ingredients?.map(
                                                (item, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                                                    >
                                                        <span className="w-7 h-7 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                                                            {idx + 1}
                                                        </span>
                                                        <span className="font-semibold text-green-600 dark:text-green-400 min-w-[80px] text-sm">
                                                            {item.measure}
                                                        </span>
                                                        <span className="text-gray-900 dark:text-white text-sm">
                                                            {item.ingredient}
                                                        </span>
                                                    </div>
                                                )
                                            )}
                                        </motion.div>
                                    )}

                                    {activeTab === "instructions" && (
                                        <motion.div
                                            key="instructions"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                        >
                                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                                                {recipe.instructions}
                                            </p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
