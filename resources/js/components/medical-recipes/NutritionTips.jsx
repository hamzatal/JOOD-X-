import React from "react";
import { motion } from "framer-motion";
import { LightbulbIcon, CheckCircleIcon } from "lucide-react";

export default function NutritionTips({ tips, lang, condition }) {
    const conditionNames = {
        ar: {
            kidney: "الكلى",
            heart: "القلب",
            diabetes: "السكري",
            pressure: "الضغط",
            colon: "القولون",
            weight: "الوزن",
            general: "عام",
        },
        en: {
            kidney: "Kidney",
            heart: "Heart",
            diabetes: "Diabetes",
            pressure: "Blood Pressure",
            colon: "Digestive",
            weight: "Weight Loss",
            general: "General",
        },
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-6 border-2 border-amber-200 dark:border-amber-800 shadow-lg"
        >
            <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center">
                    <LightbulbIcon size={24} className="text-white" />
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {lang === "ar" ? "نصائح غذائية" : "Nutrition Tips"}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        {lang === "ar" ? "خاصة بحالة: " : "For condition: "}
                        {conditionNames[lang][condition]}
                    </p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                {tips.map((tip, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex gap-3 items-start bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md"
                    >
                        <CheckCircleIcon
                            size={20}
                            className="text-green-600 flex-shrink-0 mt-0.5"
                        />
                        <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                            {tip}
                        </p>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}
