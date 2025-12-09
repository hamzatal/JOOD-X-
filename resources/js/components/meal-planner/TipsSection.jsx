// components/meal-planner/TipsSection.jsx
import React from "react";
import { motion } from "framer-motion";
import {
    Lightbulb,
    Heart,
    Apple,
    Droplets,
    Clock,
    Utensils,
} from "lucide-react";

export default function TipsSection({ lang }) {
    const t = (ar, en) => (lang === "ar" ? ar : en);

    const tips = [
        {
            icon: Droplets,
            title: t("شرب الماء", "Stay Hydrated"),
            description: t(
                "اشرب 8-10 أكواب ماء يومياً للحفاظ على صحة جسمك",
                "Drink 8-10 glasses of water daily to maintain your body health"
            ),
            color: "blue",
        },
        {
            icon: Apple,
            title: t("تنويع الطعام", "Variety is Key"),
            description: t(
                "تناول أطعمة متنوعة لضمان الحصول على جميع العناصر الغذائية",
                "Eat a variety of foods to ensure you get all nutrients"
            ),
            color: "green",
        },
        {
            icon: Clock,
            title: t("وجبات منتظمة", "Regular Meals"),
            description: t(
                "احرص على تناول 3 وجبات رئيسية في أوقات منتظمة",
                "Make sure to eat 3 main meals at regular times"
            ),
            color: "orange",
        },
        {
            icon: Heart,
            title: t("التوازن الغذائي", "Balanced Diet"),
            description: t(
                "احرص على توازن البروتينات والكربوهيدرات والدهون الصحية",
                "Ensure balance of proteins, carbs, and healthy fats"
            ),
            color: "red",
        },
        {
            icon: Utensils,
            title: t("تحضير مسبق", "Meal Prep"),
            description: t(
                "جهّز وجباتك مسبقاً لتوفير الوقت والالتزام بخطتك",
                "Prepare your meals in advance to save time and stick to your plan"
            ),
            color: "purple",
        },
        {
            icon: Lightbulb,
            title: t("استمع لجسمك", "Listen to Your Body"),
            description: t(
                "انتبه لإشارات الجوع والشبع في جسمك",
                "Pay attention to your body's hunger and fullness signals"
            ),
            color: "yellow",
        },
    ];

    const colorMap = {
        blue: "from-blue-600 to-cyan-600",
        green: "from-green-600 to-emerald-600",
        orange: "from-orange-600 to-red-600",
        red: "from-red-600 to-pink-600",
        purple: "from-purple-600 to-pink-600",
        yellow: "from-yellow-600 to-amber-600",
    };

    return (
        <section className="py-16 px-4 bg-gradient-to-b from-gray-900 to-gray-950">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <Lightbulb size={40} className="text-yellow-400" />
                        <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 bg-clip-text text-transparent">
                            {t("نصائح غذائية", "Nutrition Tips")}
                        </h2>
                    </div>
                    <p className="text-gray-400 text-lg">
                        {t(
                            "نصائح بسيطة للحفاظ على نمط حياة صحي",
                            "Simple tips to maintain a healthy lifestyle"
                        )}
                    </p>
                </motion.div>

                {/* Tips Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tips.map((tip, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            whileHover={{ scale: 1.05 }}
                            className="group relative bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl p-6 rounded-2xl border border-gray-700/50 hover:border-green-500/50 transition-all shadow-lg hover:shadow-2xl overflow-hidden"
                        >
                            {/* Background Gradient */}
                            <div
                                className={`absolute inset-0 bg-gradient-to-br ${
                                    colorMap[tip.color]
                                } opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                            ></div>

                            {/* Content */}
                            <div className="relative z-10">
                                <div
                                    className={`w-14 h-14 bg-gradient-to-br ${
                                        colorMap[tip.color]
                                    } rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                                >
                                    <tip.icon
                                        size={28}
                                        className="text-white"
                                    />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">
                                    {tip.title}
                                </h3>
                                <p className="text-gray-400 leading-relaxed">
                                    {tip.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
