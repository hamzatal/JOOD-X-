// components/meal-planner/ShoppingList.jsx
import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { X, ShoppingCart, DollarSign, Download, Printer } from "lucide-react";

export default function ShoppingList({ plan, lang, onClose }) {
    const t = (ar, en) => (lang === "ar" ? ar : en);

    const { groupedIngredients, totalCost } = useMemo(() => {
        const ingredientsMap = new Map();
        let cost = 0;

        plan.forEach((day) => {
            ["breakfast", "lunch", "dinner"].forEach((mealType) => {
                const meal = day[mealType];
                if (meal?.ingredients) {
                    meal.ingredients.forEach((ingredient) => {
                        const key = ingredient.toLowerCase().trim();
                        ingredientsMap.set(key, {
                            name: ingredient,
                            count: (ingredientsMap.get(key)?.count || 0) + 1,
                        });
                    });
                }
                if (meal?.cost) {
                    cost += meal.cost;
                }
            });
        });

        return {
            groupedIngredients: Array.from(ingredientsMap.values()).sort(
                (a, b) => a.name.localeCompare(b.name)
            ),
            totalCost: cost.toFixed(2),
        };
    }, [plan]);

    const handlePrint = () => {
        window.print();
    };

    const handleDownload = () => {
        const content = groupedIngredients
            .map((item) => `${item.name} (x${item.count})`)
            .join("\n");
        const blob = new Blob([content], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "shopping-list.txt";
        a.click();
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
                className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl border border-gray-700 shadow-2xl p-8"
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl">
                            <ShoppingCart size={28} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold">
                                {t("قائمة المشتريات", "Shopping List")}
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

                {/* Cost Summary */}
                <div className="bg-gradient-to-r from-green-900/40 to-emerald-900/40 backdrop-blur-lg p-6 rounded-2xl border border-green-700/30 mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-400 mb-1">
                                {t("التكلفة الإجمالية", "Total Cost")}
                            </p>
                            <p className="text-4xl font-bold text-white">
                                {totalCost} {t("د.أ", "JOD")}
                            </p>
                        </div>
                        <DollarSign size={48} className="text-green-400" />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mb-6">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handlePrint}
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-semibold flex items-center justify-center gap-2"
                    >
                        <Printer size={20} />
                        {t("طباعة", "Print")}
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleDownload}
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl font-semibold flex items-center justify-center gap-2"
                    >
                        <Download size={20} />
                        {t("تحميل", "Download")}
                    </motion.button>
                </div>

                {/* Ingredients List */}
                <div className="space-y-2">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <span className="text-2xl">📝</span>
                        {t("المكونات المطلوبة", "Required Ingredients")} (
                        {groupedIngredients.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {groupedIngredients.map((item, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.02 }}
                                className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl border border-gray-700/50 hover:border-blue-500/50 transition-all"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-blue-600/20 rounded-full flex items-center justify-center">
                                        <span className="text-sm font-bold text-blue-400">
                                            {item.count}
                                        </span>
                                    </div>
                                    <span className="text-gray-200">
                                        {item.name}
                                    </span>
                                </div>
                                <input
                                    type="checkbox"
                                    className="w-5 h-5 rounded accent-green-600 cursor-pointer"
                                />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
