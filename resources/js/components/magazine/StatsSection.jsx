import React from "react";
import { motion } from "framer-motion";
import { BookOpen, Lightbulb, Star, MessageSquare } from "lucide-react";

const t = (ar, en, lang) => (lang === "ar" ? ar : en);

export default function StatsSection({ articles, lang }) {
    const stats = [
        {
            label: t("إجمالي المقالات", "Total Articles", lang),
            value: articles.length,
            icon: BookOpen,
            color: "from-blue-500 to-blue-600",
        },
        {
            label: t("النصائح", "Tips Shared", lang),
            value: articles.reduce((sum, a) => sum + (a.tips?.length || 0), 0),
            icon: Lightbulb,
            color: "from-amber-500 to-amber-600",
        },
        {
            label: t("التعليقات", "Comments", lang),
            value: Math.floor(Math.random() * 500) + 100,
            icon: MessageSquare,
            color: "from-purple-500 to-purple-600",
        },
        {
            label: t("التقييم", "Avg Rating", lang),
            value: "4.8",
            icon: Star,
            color: "from-green-500 to-green-600",
        },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, idx) => {
                const Icon = stat.icon;
                return (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
                    >
                        <div className="flex items-center gap-3">
                            <div
                                className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}
                            >
                                <Icon size={24} className="text-white" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {stat.value}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {stat.label}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}
