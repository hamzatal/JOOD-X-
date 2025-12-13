import React from "react";
import {
    Newspaper,
    Lightbulb,
    Award,
    Heart,
    TrendingUp,
    Clock,
    Calendar,
    ArrowRight,
} from "lucide-react";

const t = (ar, en, lang) => (lang === "ar" ? ar : en);

export default function ArticleCard({ article, onRead, lang }) {
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

    const iconComponents = {
        Newspaper: <Newspaper size={60} className="text-white" />,
        Lightbulb: <Lightbulb size={60} className="text-white" />,
        Award: <Award size={60} className="text-white" />,
        Heart: <Heart size={60} className="text-white" />,
        TrendingUp: <TrendingUp size={60} className="text-white" />,
    };

    return (
        <div
            className="bg-white dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-xl hover:shadow-2xl transition-all duration-300 group hover:-translate-y-2 cursor-pointer"
            onClick={() => onRead(article)}
        >
            <div className="relative h-64 overflow-hidden">
                {article.image ? (
                    <img
                        src={article.image}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                ) : (
                    <div
                        className={`absolute inset-0 bg-gradient-to-br ${getCategoryColor(
                            article.category
                        )} opacity-90 group-hover:opacity-100 transition-opacity`}
                    >
                        <div className="absolute inset-0 flex items-center justify-center group-hover:scale-110 transition-transform">
                            {iconComponents[article.icon] ||
                                iconComponents.Newspaper}
                        </div>
                    </div>
                )}

                <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-10">
                    <span className="bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-white">
                        {article.categoryLabel}
                    </span>
                </div>

                {article.tips && article.tips.length > 0 && (
                    <div className="absolute bottom-3 left-3 z-10">
                        <span className="bg-green-500/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-white flex items-center gap-1">
                            <Lightbulb size={12} />
                            {article.tips.length} {t("نصائح", "tips", lang)}
                        </span>
                    </div>
                )}
            </div>

            <div className="p-5">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 hover:text-green-600 dark:hover:text-green-400 transition">
                    {article.title}
                </h3>

                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                    {article.excerpt}
                </p>

                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            {article.date}
                        </span>
                        <span className="flex items-center gap-1">
                            <Clock size={14} />
                            {article.readTime}
                        </span>
                    </div>
                </div>

                <button className="w-full py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl text-white font-medium hover:shadow-lg hover:shadow-green-500/30 transition-all flex items-center justify-center gap-2 text-sm">
                    {t("اقرأ المقال", "Read Article", lang)}
                    <ArrowRight size={14} />
                </button>
            </div>
        </div>
    );
}
