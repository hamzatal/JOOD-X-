import React from "react";
import { motion } from "framer-motion";
import {
    UtensilsCrossed,
    Salad,
    Flame,
    Beef,
    RefreshCw,
    ShoppingCart,
    PieChart,
    Printer,
    Calendar,
} from "lucide-react";

export default function FilterBar({
    lang,
    filterDiet,
    setFilterDiet,
    onRefresh,
    refreshing,
    onShowShoppingList,
    onShowNutritionSummary,
    onPrint,
}) {
    const t = (ar, en) => (lang === "ar" ? ar : en);

    const filters = [
        {
            id: "all",
            label: t("الكل", "All"),
            icon: UtensilsCrossed,
            color: "green",
        },
        {
            id: "vegan",
            label: t("نباتي", "Vegan"),
            icon: Salad,
            color: "green",
        },
        { id: "keto", label: t("كيتو", "Keto"), icon: Flame, color: "purple" },
        {
            id: "protein",
            label: t("بروتين", "Protein"),
            icon: Beef,
            color: "blue",
        },
    ];

    const colorMap = {
        green: "from-green-600 to-emerald-600",
        purple: "from-purple-600 to-pink-600",
        blue: "from-blue-600 to-cyan-600",
    };

    return (
        <section className="py-6 px-4 bg-gradient-to-b from-gray-950/95 to-gray-900/95 border-b border-gray-800">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl">
                            <Calendar size={24} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">
                                {t("خطتك الأسبوعية", "Your Weekly Plan")}
                            </h2>
                            <p className="text-xs text-gray-400">
                                {t("مخصصة لك", "Personalized for you")}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap justify-center">
                        <div className="flex items-center gap-2 bg-gray-800/80 px-2 py-2 rounded-xl border border-gray-700">
                            {filters.map((filter) => (
                                <motion.button
                                    key={filter.id}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setFilterDiet(filter.id)}
                                    className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center gap-2 ${
                                        filterDiet === filter.id
                                            ? `bg-gradient-to-r ${
                                                  colorMap[filter.color]
                                              } text-white shadow-lg`
                                            : "text-gray-400 hover:text-white"
                                    }`}
                                >
                                    <filter.icon size={16} />
                                    {filter.label}
                                </motion.button>
                            ))}
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onShowShoppingList}
                            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl font-semibold flex items-center gap-2 shadow-lg"
                        >
                            <ShoppingCart size={18} />
                            {t("قائمة المشتريات", "Shopping List")}
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onShowNutritionSummary}
                            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-semibold flex items-center gap-2 shadow-lg"
                        >
                            <PieChart size={18} />
                            {t("ملخص التغذية", "Nutrition")}
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onPrint}
                            className="px-4 py-2 bg-gradient-to-r from-gray-700 to-gray-600 rounded-xl font-semibold flex items-center gap-2 shadow-lg"
                        >
                            <Printer size={18} />
                            {t("طباعة", "Print")}
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onRefresh}
                            disabled={refreshing}
                            className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl font-semibold flex items-center gap-2 shadow-lg disabled:opacity-50"
                        >
                            <RefreshCw
                                size={18}
                                className={refreshing ? "animate-spin" : ""}
                            />
                            {refreshing
                                ? t("جاري التحديث...", "Refreshing...")
                                : t("تحديث", "Refresh")}
                        </motion.button>
                    </div>
                </div>
            </div>
        </section>
    );
}
