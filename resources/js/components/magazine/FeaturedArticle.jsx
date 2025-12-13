import React from "react";
import { motion } from "framer-motion";
import {
    Newspaper,
    Lightbulb,
    Award,
    Heart,
    TrendingUp,
    Clock,
    ArrowRight,
    Star,
} from "lucide-react";

const t = (ar, en, lang) => (lang === "ar" ? ar : en);

export default function FeaturedArticle({ article, onRead, lang }) {
    if (!article) return null;

    const iconComponents = {
        Newspaper: <Newspaper size={80} className="text-white" />,
        Lightbulb: <Lightbulb size={80} className="text-white" />,
        Award: <Award size={80} className="text-white" />,
        Heart: <Heart size={80} className="text-white" />,
        TrendingUp: <TrendingUp size={80} className="text-white" />,
    };

    const getCategoryColor = (category) => {
        const colors = {
            news: "from-blue-600 to-blue-700",
            tips: "from-purple-600 to-purple-700",
            secrets: "from-amber-600 to-amber-700",
            health: "from-rose-600 to-rose-700",
            trends: "from-teal-600 to-teal-700",
        };
        return colors[category] || "from-gray-600 to-gray-700";
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 bg-white dark:bg-gray-800 rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-2xl hover:shadow-3xl transition-shadow"
        >
            <div className="grid md:grid-cols-2 gap-0">
                <div
                    className={`relative h-64 md:h-auto bg-gradient-to-br ${getCategoryColor(
                        article.category
                    )}`}
                >
                    <div className="absolute inset-0 flex items-center justify-center">
                        {iconComponents[article.icon] ||
                            iconComponents.Newspaper}
                    </div>
                    <div className="absolute top-4 left-4">
                        <span className="bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-bold text-white flex items-center gap-2">
                            <Award size={16} />
                            {t("مقال مميز", "Featured", lang)}
                        </span>
                    </div>
                </div>

                <div className="p-6 md:p-8 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-semibold">
                                {article.categoryLabel}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                {article.date}
                            </span>
                        </div>

                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                            {article.title}
                        </h2>

                        <p className="text-gray-600 dark:text-gray-400 mb-6 line-clamp-3">
                            {article.excerpt}
                        </p>

                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-6">
                            <span className="flex items-center gap-1">
                                <Clock size={16} />
                                {article.readTime}
                            </span>
                            {article.tips && article.tips.length > 0 && (
                                <span className="flex items-center gap-1">
                                    <Lightbulb size={16} />
                                    {article.tips.length}{" "}
                                    {t("نصائح", "tips", lang)}
                                </span>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={() => onRead(article)}
                        className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-green-500/30 transition-all transform hover:scale-105"
                    >
                        {t("اقرأ المقال", "Read Article", lang)}
                        <ArrowRight size={20} />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
