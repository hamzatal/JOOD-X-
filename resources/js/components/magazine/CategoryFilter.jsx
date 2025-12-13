import React from "react";
import {
    Sparkles,
    Newspaper,
    Lightbulb,
    Award,
    Heart,
    TrendingUp,
} from "lucide-react";

const t = (ar, en, lang) => (lang === "ar" ? ar : en);

export default function CategoryFilter({
    selectedCategory,
    setSelectedCategory,
    lang,
}) {
    const categories = [
        { id: "all", label: t("الكل", "All", lang), icon: Sparkles },
        { id: "news", label: t("أخبار", "News", lang), icon: Newspaper },
        { id: "tips", label: t("نصائح", "Tips", lang), icon: Lightbulb },
        { id: "secrets", label: t("أسرار", "Secrets", lang), icon: Award },
        { id: "health", label: t("صحة", "Health", lang), icon: Heart },
        { id: "trends", label: t("صيحات", "Trends", lang), icon: TrendingUp },
    ];

    return (
        <div className="flex flex-wrap gap-3">
            {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                    <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all transform hover:scale-105 ${
                            selectedCategory === cat.id
                                ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-500/30"
                                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                    >
                        <Icon size={18} />
                        {cat.label}
                    </button>
                );
            })}
        </div>
    );
}
