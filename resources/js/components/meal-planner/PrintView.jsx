// components/meal-planner/PrintView.jsx
import React from "react";
import { motion } from "framer-motion";
import { X, Printer } from "lucide-react";

export default function PrintView({ plan, lang, onClose }) {
    const t = (ar, en) => (lang === "ar" ? ar : en);

    const handlePrint = () => {
        window.print();
    };

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
                className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl p-8"
            >
                {/* Header - Hide on Print */}
                <div className="flex items-center justify-between mb-6 print:hidden">
                    <h2 className="text-3xl font-bold text-gray-900">
                        {t("طباعة خطة الوجبات", "Print Meal Plan")}
                    </h2>
                    <div className="flex gap-3">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handlePrint}
                            className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold flex items-center gap-2"
                        >
                            <Printer size={20} />
                            {t("طباعة", "Print")}
                        </motion.button>
                        <button
                            onClick={onClose}
                            className="p-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Printable Content */}
                <div className="print:text-black">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">
                            {t("خطة الوجبات الأسبوعية", "Weekly Meal Plan")}
                        </h1>
                        <p className="text-gray-600">
                            {new Date().toLocaleDateString(
                                lang === "ar" ? "ar-JO" : "en-US"
                            )}
                        </p>
                    </div>

                    {plan.map((day, idx) => (
                        <div key={idx} className="mb-8 break-inside-avoid">
                            <h2 className="text-2xl font-bold text-green-700 mb-4 border-b-2 border-green-600 pb-2">
                                {day.day}
                            </h2>
                            <div className="space-y-4">
                                {["breakfast", "lunch", "dinner"].map(
                                    (mealType) => {
                                        const meal = day[mealType];
                                        if (!meal) return null;

                                        return (
                                            <div
                                                key={mealType}
                                                className="pl-4"
                                            >
                                                <h3 className="text-lg font-bold text-gray-800 mb-2">
                                                    {mealType === "breakfast"
                                                        ? t(
                                                              "☀️ إفطار",
                                                              "☀️ Breakfast"
                                                          )
                                                        : mealType === "lunch"
                                                        ? t(
                                                              "🍽️ غداء",
                                                              "🍽️ Lunch"
                                                          )
                                                        : t(
                                                              "🌙 عشاء",
                                                              "🌙 Dinner"
                                                          )}
                                                    :{" "}
                                                    {meal.name || meal.strMeal}
                                                </h3>
                                                {meal.nutrition && (
                                                    <p className="text-sm text-gray-600 mb-2">
                                                        {t("سعرات", "Calories")}
                                                        :{" "}
                                                        {
                                                            meal.nutrition
                                                                .calories
                                                        }{" "}
                                                        |{" "}
                                                        {t("بروتين", "Protein")}
                                                        :{" "}
                                                        {meal.nutrition.protein}
                                                        g | {t("كارب", "Carbs")}
                                                        : {meal.nutrition.carbs}
                                                        g | {t("دهون", "Fat")}:{" "}
                                                        {meal.nutrition.fat}g
                                                    </p>
                                                )}
                                                {meal.ingredients &&
                                                    meal.ingredients.length >
                                                        0 && (
                                                        <ul className="text-sm text-gray-700 list-disc list-inside">
                                                            {meal.ingredients
                                                                .slice(0, 5)
                                                                .map(
                                                                    (
                                                                        ing,
                                                                        i
                                                                    ) => (
                                                                        <li
                                                                            key={
                                                                                i
                                                                            }
                                                                        >
                                                                            {
                                                                                ing
                                                                            }
                                                                        </li>
                                                                    )
                                                                )}
                                                        </ul>
                                                    )}
                                            </div>
                                        );
                                    }
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>
        </motion.div>
    );
}
