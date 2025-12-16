import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useLang } from "../context/LangContext";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import {
    Search,
    RefreshCw,
    Loader2,
    Sparkles,
    BookOpen,
    ChefHat,
    Newspaper,
    Lightbulb,
    Award,
    Heart,
    TrendingUp,
    Clock,
    Calendar,
    ArrowRight,
    X,
    Share2,
    Printer,
    Apple,
    Coffee,
    Filter,
} from "lucide-react";

const t = (ar, en, lang) => (lang === "ar" ? ar : en);

export default function JoodMagazinePage() {
    const { lang } = useLang();
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const isRTL = lang === "ar";

    useEffect(() => {
        loadArticles();
    }, [selectedCategory, lang]);

    useEffect(() => {
        if (selectedArticle) {
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [selectedArticle]);

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

    const categories = [
        { id: "all", label: t("الكل", "All", lang), icon: Sparkles },
        { id: "news", label: t("أخبار", "News", lang), icon: Newspaper },
        { id: "tips", label: t("نصائح", "Tips", lang), icon: Lightbulb },
        { id: "secrets", label: t("أسرار", "Secrets", lang), icon: Award },
        { id: "health", label: t("صحة", "Health", lang), icon: Heart },
        { id: "trends", label: t("ترندات", "Trends", lang), icon: TrendingUp },
    ];

    const getCategoryColor = (category) => {
        const colors = {
            news: "from-blue-600 to-indigo-600",
            tips: "from-purple-600 to-pink-600",
            secrets: "from-amber-600 to-orange-600",
            health: "from-rose-600 to-red-600",
            trends: "from-teal-600 to-cyan-600",
        };
        return colors[category] || "from-gray-600 to-gray-700";
    };

    const iconComponents = {
        Newspaper: Newspaper,
        Lightbulb: Lightbulb,
        Award: Award,
        Heart: Heart,
        TrendingUp: TrendingUp,
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 dark:from-gray-950 dark:via-slate-950 dark:to-gray-950">
            <Navbar />

            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 text-white py-24 px-6">
                <div className="absolute inset-0 overflow-hidden opacity-10">
                    <div className="absolute top-10 left-10 animate-float">
                        <BookOpen size={60} />
                    </div>
                    <div className="absolute top-20 right-20 animate-float-delayed">
                        <ChefHat size={80} />
                    </div>
                    <div className="absolute bottom-20 left-1/4 animate-float">
                        <Newspaper size={70} />
                    </div>
                    <div className="absolute bottom-10 right-1/3 animate-float-delayed">
                        <Apple size={90} />
                    </div>
                    <div className="absolute top-1/2 left-1/2 animate-float">
                        <Coffee size={65} />
                    </div>
                </div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center"
                    >
                        <div className="flex items-center justify-center gap-4 mb-6">
                            <motion.div
                                animate={{
                                    scale: [1, 1.2, 1],
                                    rotate: [0, 5, -5, 0],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    repeatDelay: 1,
                                }}
                            >
                                <BookOpen
                                    size={56}
                                    className="text-yellow-200"
                                />
                            </motion.div>
                            <h1 className="text-5xl md:text-7xl font-bold text-white drop-shadow-2xl">
                                {t(
                                    "مجلة جود للطبخ",
                                    "Jood Cooking Magazine",
                                    lang
                                )}
                            </h1>
                            <motion.div
                                animate={{
                                    scale: [1, 1.2, 1],
                                    rotate: [0, -5, 5, 0],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    repeatDelay: 1,
                                    delay: 0.5,
                                }}
                            >
                                <Sparkles
                                    size={56}
                                    className="text-amber-200"
                                />
                            </motion.div>
                        </div>

                        <p className="text-xl md:text-2xl text-green-50 max-w-3xl mx-auto mb-6 leading-relaxed drop-shadow-lg">
                            {t(
                                "عالمك الشامل لأخبار الطبخ، النصائح، الأسرار، والمعلومات الصحية",
                                "Your complete world of cooking news, tips, secrets, and health information",
                                lang
                            )}
                        </p>

                        <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
                            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-5 py-3 rounded-full border-2 border-white/30 hover:scale-105 transition-transform cursor-pointer shadow-xl">
                                <Newspaper size={22} />
                                <span className="text-sm font-semibold">
                                    {t("أخبار يومية", "Daily News", lang)}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-5 py-3 rounded-full border-2 border-white/30 hover:scale-105 transition-transform cursor-pointer shadow-xl">
                                <Lightbulb size={22} />
                                <span className="text-sm font-semibold">
                                    {t("نصائح احترافية", "Expert Tips", lang)}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-5 py-3 rounded-full border-2 border-white/30 hover:scale-105 transition-transform cursor-pointer shadow-xl">
                                <Heart size={22} />
                                <span className="text-sm font-semibold">
                                    {t("معلومات صحية", "Health Info", lang)}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                </div>

                <div className="absolute bottom-0 left-0 right-0">
                    <svg
                        viewBox="0 0 1440 80"
                        className="w-full h-16 fill-slate-50 dark:fill-gray-950"
                    >
                        <path d="M0,40L48,45C96,50,192,60,288,60C384,60,480,50,576,45C672,40,768,40,864,45C960,50,1056,60,1152,60C1248,60,1344,50,1392,45L1440,40L1440,80L0,80Z"></path>
                    </svg>
                </div>
            </section>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 -mt-6 relative z-20">
                {/* Control Panel */}
                <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 md:p-8 mb-8">
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8">
                        <div className="flex items-center gap-3">
                            <Filter
                                className="text-emerald-600 dark:text-emerald-400"
                                size={32}
                            />
                            <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                                {t("استكشف المجلة", "Explore Magazine", lang)}
                            </h2>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={generateNewArticles}
                            disabled={generating}
                            className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-2xl font-bold flex items-center gap-3 shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            <RefreshCw
                                size={20}
                                className={generating ? "animate-spin" : ""}
                            />
                            {generating
                                ? t("جاري التوليد...", "Generating...", lang)
                                : t("توليد جديد", "Generate New", lang)}
                        </motion.button>
                    </div>

                    {/* Search Bar */}
                    <div className="mb-8">
                        <div className="relative">
                            <Search
                                className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400"
                                size={22}
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
                                className="w-full pl-14 pr-6 py-5 bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 transition-all text-lg"
                            />
                        </div>
                    </div>

                    {/* Category Filter */}
                    <div className="flex flex-wrap gap-3">
                        {categories.map((cat) => {
                            const Icon = cat.icon;
                            return (
                                <motion.button
                                    key={cat.id}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-semibold transition-all shadow-lg ${
                                        selectedCategory === cat.id
                                            ? "bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-emerald-500/40"
                                            : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                    }`}
                                >
                                    <Icon size={20} />
                                    {cat.label}
                                </motion.button>
                            );
                        })}
                    </div>
                </div>

                {/* Generation Progress */}
                {generating && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-emerald-200/50 dark:border-emerald-700/50 p-8 mb-8"
                    >
                        <div className="flex items-center gap-5">
                            <Loader2
                                size={40}
                                className="text-emerald-600 animate-spin"
                            />
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                                    {t(
                                        "جاري توليد المقالات...",
                                        "Generating articles...",
                                        lang
                                    )}
                                </h3>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-emerald-600 to-green-600 rounded-full animate-pulse w-3/4 shadow-lg" />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Articles Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div
                                key={i}
                                className="bg-white dark:bg-gray-900 rounded-3xl overflow-hidden animate-pulse shadow-xl"
                            >
                                <div className="h-72 bg-gray-300 dark:bg-gray-700"></div>
                                <div className="p-6 space-y-4">
                                    <div className="h-7 bg-gray-300 dark:bg-gray-700 rounded-xl"></div>
                                    <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded-xl w-3/4"></div>
                                    <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded-xl w-1/2"></div>
                                    <div className="h-12 bg-gray-300 dark:bg-gray-700 rounded-2xl mt-6"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredArticles.length > 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        {filteredArticles.map((article, index) => {
                            const IconComponent =
                                iconComponents[article.icon] || Newspaper;
                            return (
                                <motion.div
                                    key={article.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-white dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 rounded-3xl overflow-hidden border-2 border-gray-200/50 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 group hover:-translate-y-2 cursor-pointer"
                                    onClick={() => setSelectedArticle(article)}
                                >
                                    <div className="relative h-72 overflow-hidden">
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
                                                    <IconComponent
                                                        size={70}
                                                        className="text-white"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
                                            <span className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full text-xs font-bold text-white border border-white/20 shadow-lg">
                                                {article.categoryLabel}
                                            </span>
                                        </div>

                                        {article.tips &&
                                            article.tips.length > 0 && (
                                                <div className="absolute bottom-4 left-4 z-10">
                                                    <span className="bg-emerald-500/90 backdrop-blur-md px-4 py-2 rounded-full text-xs font-bold text-white flex items-center gap-2 border border-white/20 shadow-lg">
                                                        <Lightbulb size={14} />
                                                        {
                                                            article.tips.length
                                                        }{" "}
                                                        {t(
                                                            "نصائح",
                                                            "tips",
                                                            lang
                                                        )}
                                                    </span>
                                                </div>
                                            )}
                                    </div>

                                    <div className="p-6">
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 hover:text-emerald-600 dark:hover:text-emerald-400 transition leading-tight">
                                            {article.title}
                                        </h3>

                                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-5 line-clamp-3 leading-relaxed">
                                            {article.excerpt}
                                        </p>

                                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500 mb-5 pb-5 border-b-2 border-gray-200 dark:border-gray-700">
                                            <div className="flex items-center gap-4">
                                                <span className="flex items-center gap-1.5 font-medium">
                                                    <Calendar size={15} />
                                                    {article.date}
                                                </span>
                                                <span className="flex items-center gap-1.5 font-medium">
                                                    <Clock size={15} />
                                                    {article.readTime}
                                                </span>
                                            </div>
                                        </div>

                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-green-600 rounded-2xl text-white font-bold hover:shadow-xl hover:shadow-emerald-500/40 transition-all flex items-center justify-center gap-2"
                                        >
                                            {t(
                                                "اقرأ المقال",
                                                "Read Article",
                                                lang
                                            )}
                                            <ArrowRight size={18} />
                                        </motion.button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-24 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-gray-200/50 dark:border-gray-700/50"
                    >
                        <Sparkles
                            size={100}
                            className="mx-auto text-gray-300 dark:text-gray-600 mb-8"
                        />
                        <h3 className="text-3xl font-bold text-gray-600 dark:text-gray-400 mb-4">
                            {t("لا توجد مقالات", "No articles found", lang)}
                        </h3>
                        <p className="text-gray-500 mb-8 text-lg">
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
                            className="px-10 py-5 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-2xl font-bold shadow-2xl hover:shadow-emerald-500/50 transition-all"
                        >
                            {t("توليد الآن", "Generate Now", lang)}
                        </motion.button>
                    </motion.div>
                )}
            </main>

            {/* Article Modal */}
            <AnimatePresence>
                {selectedArticle && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
                        onClick={() => setSelectedArticle(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: "spring", damping: 25 }}
                            className={`bg-gray-900 rounded-3xl shadow-2xl border border-gray-800 w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col lg:flex-row ${
                                isRTL ? "lg:flex-row-reverse" : ""
                            }`}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Image Section */}
                            <div className="relative flex-shrink-0">
                                {selectedArticle.image ? (
                                    <img
                                        src={selectedArticle.image}
                                        alt={selectedArticle.title}
                                        className="w-full h-64 lg:w-96 lg:h-full object-cover"
                                    />
                                ) : (
                                    <div
                                        className={`w-full h-64 lg:w-96 lg:h-full bg-gradient-to-br ${getCategoryColor(
                                            selectedArticle.category
                                        )}`}
                                    />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                                <div
                                    className={`absolute bottom-4 ${
                                        isRTL ? "right-4" : "left-4"
                                    } flex gap-2`}
                                >
                                    <span className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600/90 backdrop-blur-sm rounded-full text-white text-sm font-semibold border border-emerald-500/50 shadow-lg">
                                        <Calendar size={14} />
                                        {selectedArticle.date}
                                    </span>
                                    <span className="flex items-center gap-2 px-3 py-1.5 bg-amber-600/90 backdrop-blur-sm rounded-full text-white text-sm font-semibold border border-amber-500/50 shadow-lg">
                                        <Clock size={14} />
                                        {selectedArticle.readTime}
                                    </span>
                                </div>
                            </div>

                            {/* Content Section */}
                            <div
                                className="flex-1 flex flex-col"
                                dir={isRTL ? "rtl" : "ltr"}
                            >
                                {/* Header */}
                                <div
                                    className={`flex justify-between items-start p-6 pb-4 border-b border-gray-800 ${
                                        isRTL ? "flex-row-reverse" : ""
                                    }`}
                                >
                                    <div
                                        className={`flex-1 ${
                                            isRTL ? "pl-6" : "pr-6"
                                        }`}
                                    >
                                        <span className="inline-block px-3 py-1 bg-emerald-600/20 text-emerald-400 rounded-full text-xs font-semibold mb-3">
                                            {selectedArticle.categoryLabel}
                                        </span>
                                        <h2
                                            className={`text-2xl md:text-3xl font-bold bg-gradient-to-r from-emerald-400 via-green-300 to-teal-400 bg-clip-text text-transparent leading-tight ${
                                                isRTL
                                                    ? "text-right"
                                                    : "text-left"
                                            }`}
                                        >
                                            {selectedArticle.title}
                                        </h2>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() =>
                                                navigator
                                                    .share?.({
                                                        title: selectedArticle.title,
                                                        text: selectedArticle.excerpt,
                                                        url: window.location
                                                            .href,
                                                    })
                                                    .catch(() => {})
                                            }
                                            className="p-2.5 rounded-xl bg-gray-800/80 hover:bg-gray-700 text-gray-400 hover:text-white transition hover:scale-110"
                                        >
                                            <Share2 size={20} />
                                        </button>
                                        <button
                                            onClick={() => window.print()}
                                            className="p-2.5 rounded-xl bg-gray-800/80 hover:bg-gray-700 text-gray-400 hover:text-white transition hover:scale-110"
                                        >
                                            <Printer size={20} />
                                        </button>
                                        <button
                                            onClick={() =>
                                                setSelectedArticle(null)
                                            }
                                            className="p-2.5 rounded-xl bg-gray-800/80 hover:bg-red-600/80 text-gray-400 hover:text-white transition hover:scale-110"
                                        >
                                            <X size={24} />
                                        </button>
                                    </div>
                                </div>

                                {/* Scrollable Content */}
                                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                                    {/* Excerpt */}
                                    <div className="bg-emerald-900/20 border-l-4 border-emerald-500 p-4 rounded-r-xl">
                                        <p
                                            className={`text-gray-300 font-medium italic ${
                                                isRTL
                                                    ? "text-right"
                                                    : "text-left"
                                            }`}
                                        >
                                            {selectedArticle.excerpt}
                                        </p>
                                    </div>

                                    {/* Main Content */}
                                    <div>
                                        <h3
                                            className={`text-xl font-bold text-emerald-400 mb-4 flex items-center gap-3 ${
                                                isRTL ? "flex-row-reverse" : ""
                                            }`}
                                        >
                                            <BookOpen size={22} />
                                            {t("المحتوى", "Content", lang)}
                                        </h3>
                                        <div
                                            className={`text-gray-300 leading-relaxed text-sm md:text-base whitespace-pre-line bg-gray-800/50 p-5 rounded-2xl border border-gray-700/50 ${
                                                isRTL
                                                    ? "text-right"
                                                    : "text-left"
                                            }`}
                                        >
                                            {selectedArticle.content ||
                                                t(
                                                    "لا يوجد محتوى متاح",
                                                    "No content available",
                                                    lang
                                                )}
                                        </div>
                                    </div>

                                    {/* Tips */}
                                    {selectedArticle.tips &&
                                        selectedArticle.tips.length > 0 && (
                                            <div>
                                                <h3
                                                    className={`text-xl font-bold text-amber-400 mb-4 flex items-center gap-3 ${
                                                        isRTL
                                                            ? "flex-row-reverse"
                                                            : ""
                                                    }`}
                                                >
                                                    <Sparkles size={22} />
                                                    {t(
                                                        `نصائح إضافية (${selectedArticle.tips.length})`,
                                                        `Additional Tips (${selectedArticle.tips.length})`,
                                                        lang
                                                    )}
                                                </h3>
                                                <div className="grid grid-cols-1 gap-3">
                                                    {selectedArticle.tips.map(
                                                        (tip, i) => (
                                                            <div
                                                                key={i}
                                                                className={`flex ${
                                                                    isRTL
                                                                        ? "flex-row-reverse"
                                                                        : "flex-row"
                                                                } items-start gap-3 p-3 bg-gray-800/60 rounded-xl border border-gray-700/50 hover:border-amber-500/50 transition-all`}
                                                            >
                                                                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                                                    {i + 1}
                                                                </div>
                                                                <span
                                                                    className={`text-gray-200 font-medium text-sm flex-1 ${
                                                                        isRTL
                                                                            ? "text-right"
                                                                            : "text-left"
                                                                    }`}
                                                                >
                                                                    {tip}
                                                                </span>
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <Footer />

            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(5deg); }
                }
                @keyframes float-delayed {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-15px) rotate(-5deg); }
                }
                .animate-float { 
                    animation: float 6s ease-in-out infinite; 
                }
                .animate-float-delayed { 
                    animation: float-delayed 7s ease-in-out infinite; 
                }
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
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(31, 41, 55, 0.5);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: linear-gradient(180deg, #10b981, #059669);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: linear-gradient(180deg, #059669, #047857);
                }
            `}</style>
        </div>
    );
}
