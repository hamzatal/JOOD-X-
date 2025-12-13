import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { useLang } from "../context/LangContext";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import HeroSection from "../Components/magazine/HeroSection";
import CategoryFilter from "../Components/magazine/CategoryFilter";
import ArticleCard from "../Components/magazine/ArticleCard";
import ArticleModal from "../Components/magazine/ArticleModal";
import LoadingSkeleton from "../Components/magazine/LoadingSkeleton";
import { Search, RefreshCwIcon, Loader2Icon, Sparkles } from "lucide-react";

const t = (ar, en, lang) => (lang === "ar" ? ar : en);

export default function JoodMagazinePage() {
    const { lang } = useLang();
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        loadArticles();
    }, [selectedCategory, lang]);

const loadArticles = async () => {
    setLoading(true);
    try {
        const response = await axios.post("/api/magazine/articles", {
            category: selectedCategory,
            lang: lang,
        });

        if (response.data.success && response.data.data) {
            setArticles(response.data.data);
        } else {
            setArticles([]);
        }
    } catch (error) {
        console.error("Error loading articles:", error);

        // عرض الخطأ المفصل
        if (error.response?.data) {
            console.error("Full error:", error.response.data);
            alert(`Error: ${error.response.data.message || "Unknown error"}`);
        }

        setArticles([]);
    } finally {
        setLoading(false);
    }
};


    const generateNewArticles = async () => {
        setGenerating(true);
        try {
            const response = await axios.post("/api/magazine/refresh", {
                category: selectedCategory,
                lang: lang,
            });

            if (response.data.success) {
                await loadArticles();
            }
        } catch (error) {
            console.error("Error generating articles:", error);
        } finally {
            setGenerating(false);
        }
    };

    const filteredArticles = articles.filter(
        (article) =>
            searchQuery === "" ||
            article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            article.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-50 via-green-50 to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
            <Navbar />

            <HeroSection lang={lang} />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 -mt-6 relative z-20">
                {/* Control Panel */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 md:p-6 mb-6">
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
                        <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                            {t("استكشف المجلة", "Explore Magazine", lang)}
                        </h2>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={generateNewArticles}
                            disabled={generating}
                            className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold flex items-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <RefreshCwIcon
                                size={18}
                                className={generating ? "animate-spin" : ""}
                            />
                            {generating
                                ? t("جاري التوليد...", "Generating...", lang)
                                : t("توليد جديد", "Generate New", lang)}
                        </motion.button>
                    </div>

                    {/* Search */}
                    <div className="mb-6">
                        <div className="relative">
                            <Search
                                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                                size={20}
                            />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={t(
                                    "ابحث في المجلة...",
                                    "Search in magazine...",
                                    lang
                                )}
                                className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-green-500 transition"
                            />
                        </div>
                    </div>

                    {/* Category Filter */}
                    <CategoryFilter
                        selectedCategory={selectedCategory}
                        setSelectedCategory={setSelectedCategory}
                        lang={lang}
                    />
                </div>

                {/* Generation Progress */}
                {generating && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-6"
                    >
                        <div className="flex items-center gap-4">
                            <Loader2Icon
                                size={32}
                                className="text-green-600 animate-spin"
                            />
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                    {t(
                                        "جاري توليد المقالات...",
                                        "Generating articles...",
                                        lang
                                    )}
                                </h3>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-green-600 to-emerald-600 rounded-full animate-pulse w-3/4" />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Content */}
                {loading ? (
                    <LoadingSkeleton />
                ) : filteredArticles.length > 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {filteredArticles.map((article) => (
                            <ArticleCard
                                key={article.id}
                                article={article}
                                onRead={setSelectedArticle}
                                lang={lang}
                            />
                        ))}
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl shadow-xl"
                    >
                        <Sparkles
                            size={80}
                            className="mx-auto text-gray-300 dark:text-gray-600 mb-6"
                        />
                        <h3 className="text-2xl font-bold text-gray-600 dark:text-gray-400 mb-3">
                            {t("لا توجد مقالات", "No articles found", lang)}
                        </h3>
                        <p className="text-gray-500 mb-6">
                            {t(
                                "اضغط 'توليد جديد' لإنشاء مقالات جديدة",
                                "Click 'Generate New' to create new articles",
                                lang
                            )}
                        </p>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={generateNewArticles}
                            className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl font-bold shadow-xl"
                        >
                            {t("توليد الآن", "Generate Now", lang)}
                        </motion.button>
                    </motion.div>
                )}
            </main>

            {/* Article Modal */}
            <ArticleModal
                article={selectedArticle}
                onClose={() => setSelectedArticle(null)}
                lang={lang}
            />

            <Footer />

            <style>{`
                .line-clamp-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                .line-clamp-3 {
                    display: -webkit-box;
                    -webkit-line-clamp: 3;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
            `}</style>
        </div>
    );
}
