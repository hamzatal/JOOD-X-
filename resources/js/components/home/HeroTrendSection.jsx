import { useEffect, useState, useRef } from "react";
import {
    ArrowRight,
    Star,
    ChefHat,
    Globe,
    TrendingUp,
    ChevronLeft,
    ChevronRight,
    RefreshCw,
    Play,
    Pause,
    Sparkles,
    ChevronsLeft,
    ChevronsRight,
} from "lucide-react";
import RecipeModal from "@/components/home/RecipeModal";
import { useLang } from "@/context/LangContext";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

export default function HeroTrendSection() {
    const { lang } = useLang();
    const previousLang = useRef(lang);

    const [trending, setTrending] = useState([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const t = (ar, en) => (lang === "ar" ? ar : en);

    const fetchRecipes = async (refresh = false) => {
        if (refresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }

        try {
            const res = await axios.get(
                `/api/home-page?lang=${lang}&refresh=${
                    refresh ? "true" : "false"
                }`
            );
            setTrending(res.data.recipes || []);
            setActiveIndex(0);
        } catch (error) {
            console.error("Error fetching recipes:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Fetch on mount
    useEffect(() => {
        fetchRecipes();
    }, []);

    // Fetch when language changes
    useEffect(() => {
        if (previousLang.current !== lang) {
            fetchRecipes(true);
            previousLang.current = lang;
        }
    }, [lang]);

    // Auto-slide
    useEffect(() => {
        if (isPaused || trending.length <= 1) return;

        const id = setInterval(() => {
            setActiveIndex((i) => (i + 1) % trending.length);
        }, 8000);

        return () => clearInterval(id);
    }, [trending.length, isPaused]);

    const meal = trending[activeIndex];

    const handleOpenModal = () => {
        setIsPaused(true);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setIsPaused(false);
    };

    const handleRefresh = () => {
        fetchRecipes(true);
    };

    const togglePause = () => {
        setIsPaused(!isPaused);
    };

    if (loading) {
        return (
            <section className="relative min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto"></div>
                    <p className="text-gray-400">
                        {t("جاري تحميل الوصفات...", "Loading recipes...")}
                    </p>
                </div>
            </section>
        );
    }

    if (!meal) {
        return (
            <section className="relative min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 flex items-center justify-center">
                <p className="text-gray-400">
                    {t("لا توجد وصفات متاحة", "No recipes available")}
                </p>
            </section>
        );
    }

    const displayTitle =
        lang === "ar" && meal.strMealAr ? meal.strMealAr : meal.strMeal;
    const displayCategory =
        lang === "ar" && meal.strCategoryAr
            ? meal.strCategoryAr
            : meal.strCategory;
    const displayArea =
        lang === "ar" && meal.strAreaAr ? meal.strAreaAr : meal.strArea;
    const displayDescription =
        lang === "ar" && meal.strDescriptionAr
            ? meal.strDescriptionAr
            : meal.strDescription;

    return (
        <section className="relative w-full min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 overflow-hidden flex items-center">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
                <div className="absolute top-20 left-10 w-96 h-96 bg-green-500/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl animate-pulse"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-8 py-5 relative z-10 w-full">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Content Side */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={`content-${activeIndex}`}
                            initial={{
                                opacity: 0,
                                x: lang === "ar" ? 50 : -50,
                            }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: lang === "ar" ? -50 : 50 }}
                            transition={{ duration: 0.5 }}
                            className={`space-y-6 ${
                                lang === "ar"
                                    ? "text-right order-2 lg:order-2"
                                    : "text-left order-1 lg:order-1"
                            }`}
                        >
                            {/* Top Actions */}
                            <div
                                className={`flex items-center gap-3 flex-wrap ${
                                    lang === "ar"
                                        ? "justify-end"
                                        : "justify-start"
                                }`}
                            >
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleRefresh}
                                    disabled={refreshing}
                                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 rounded-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <RefreshCw
                                        className={`w-4 h-4 text-white ${
                                            refreshing ? "animate-spin" : ""
                                        }`}
                                    />
                                    <span className="text-sm font-semibold text-white">
                                        {t("وصفات جديدة", "New Recipes")}
                                    </span>
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={togglePause}
                                    className="flex items-center gap-2 px-4 py-2 bg-gray-800/80 hover:bg-gray-700 rounded-xl transition-all shadow-lg"
                                >
                                    {isPaused ? (
                                        <Play className="w-4 h-4 text-white" />
                                    ) : (
                                        <Pause className="w-4 h-4 text-white" />
                                    )}
                                    <span className="text-sm font-semibold text-white">
                                        {t(
                                            isPaused ? "تشغيل" : "إيقاف",
                                            isPaused ? "Play" : "Pause"
                                        )}
                                    </span>
                                </motion.button>

                                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600/20 to-amber-600/20 px-3 py-2 rounded-xl text-sm text-green-300 border border-green-500/30">
                                    <Star className="w-4 h-4" />
                                    {t("الأكثر شعبية", "Most Popular")}
                                </div>

                                <div className="inline-flex items-center gap-2 bg-gray-800/50 px-3 py-2 rounded-xl text-sm text-gray-300 border border-gray-700/50">
                                    <span>#{activeIndex + 1}</span>
                                </div>
                            </div>

                            {/* Title */}
                            <h1 className="text-4xl md:text-5xl lg:text-4xl font-bold leading-tight text-white">
                                {displayTitle}
                            </h1>

                            {/* Badges */}
                            <div
                                className={`flex gap-3 flex-wrap ${
                                    lang === "ar"
                                        ? "justify-end"
                                        : "justify-start"
                                }`}
                            >
                                <span className="flex items-center gap-2 px-4 py-2 bg-gray-800/70 rounded-xl border border-gray-700 text-sm text-gray-200">
                                    <ChefHat className="w-5 h-5 text-green-400" />
                                    <span>{displayCategory}</span>
                                </span>
                                <span className="flex items-center gap-2 px-4 py-2 bg-gray-800/70 rounded-xl border border-gray-700 text-sm text-gray-200">
                                    <Globe className="w-5 h-5 text-amber-400" />
                                    <span>{displayArea}</span>
                                </span>
                            </div>

                            {/* Description */}
                            <p className="text-gray-300 text-sm leading-relaxed">
                                {displayDescription ||
                                    t(
                                        "وصفة شهية ولذيذة تستحق التجربة",
                                        "A delicious recipe worth trying"
                                    )}
                            </p>

                            {/* View Recipe Button */}
                            <div
                                className={`flex gap-3 ${
                                    lang === "ar"
                                        ? "justify-end"
                                        : "justify-start"
                                }`}
                            >
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleOpenModal}
                                    className={`group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-600 to-green-500 rounded-xl text-white font-bold text-lg hover:shadow-xl hover:shadow-green-500/40 transition-all ${
                                        lang === "ar" ? "flex-row-reverse" : ""
                                    }`}
                                >
                                    {t("عرض الوصفة", "View Recipe")}
                                    <ArrowRight
                                        className={`w-6 h-6 group-hover:${
                                            lang === "ar"
                                                ? "-translate-x-1"
                                                : "translate-x-1"
                                        } transition`}
                                    />
                                </motion.button>
                            </div>

                            {/* MINI CARDS CAROUSEL */}
                            <div className="mt-10 space-y-4">
                                <h3
                                    className={`text-base font-medium text-gray-400 ${
                                        lang === "ar"
                                            ? "text-right"
                                            : "text-left"
                                    }`}
                                >
                                    {t("تصفح الوصفات", "Browse Recipes")}
                                </h3>

                                <div className="grid grid-cols-5 gap-3">
                                    {trending.map((item, idx) => (
                                        <button
                                            key={item.idMeal}
                                            onClick={() => setActiveIndex(idx)}
                                            className={`relative group rounded-lg overflow-hidden aspect-square transition-all ${
                                                idx === activeIndex
                                                    ? "ring-2 ring-green-500 scale-105"
                                                    : "opacity-60 hover:opacity-100"
                                            }`}
                                        >
                                            <img
                                                src={item.strMealThumb}
                                                alt={item.strMeal}
                                                className="w-full h-full object-cover"
                                            />

                                            {idx === activeIndex && (
                                                <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                                                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                                                        <svg
                                                            className="w-4 h-4 text-white"
                                                            fill="currentColor"
                                                            viewBox="0 0 20 20"
                                                        >
                                                            <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Image Side */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={`image-${activeIndex}`}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.5 }}
                            className={`flex justify-center ${
                                lang === "ar"
                                    ? "order-1 lg:order-1"
                                    : "order-2 lg:order-2"
                            }`}
                        >
                            <div className="relative w-full max-w-lg">
                                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-amber-500 rounded-3xl blur-2xl opacity-20 animate-pulse"></div>
                                <div className="relative rounded-3xl shadow-2xl overflow-hidden border border-gray-700/50 hover:border-gray-600/50 transition-all">
                                    <div className="relative group">
                                        <img
                                            src={meal.strMealThumb}
                                            alt={displayTitle}
                                            className="w-full h-96 lg:h-[480px] object-cover group-hover:scale-105 transition-transform duration-700"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>

                                        <div
                                            className={`absolute top-4 ${
                                                lang === "ar"
                                                    ? "left-4"
                                                    : "right-4"
                                            } bg-gradient-to-r from-green-500 to-amber-500 text-white px-4 py-2 rounded-full flex items-center gap-2 text-sm font-bold shadow-xl`}
                                        >
                                            <TrendingUp className="w-5 h-5" />#
                                            {activeIndex + 1}
                                        </div>

                                        <div
                                            className={`absolute bottom-0 left-0 right-0 p-6 ${
                                                lang === "ar"
                                                    ? "text-right"
                                                    : "text-left"
                                            }`}
                                        >
                                            <h3 className="text-2xl font-bold text-white mb-3">
                                                {displayTitle}
                                            </h3>
                                            <div
                                                className={`flex items-center gap-4 text-sm text-gray-200 ${
                                                    lang === "ar"
                                                        ? "justify-end"
                                                        : "justify-start"
                                                }`}
                                            >
                                                <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                                                    <ChefHat className="w-4 h-4 text-green-400" />
                                                    <span>
                                                        {displayCategory}
                                                    </span>
                                                </div>
                                                <div className="w-1.5 h-1.5 bg-gray-500 rounded-full"></div>
                                                <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                                                    <Globe className="w-4 h-4 text-amber-400" />
                                                    <span>{displayArea}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {showModal && meal && (
                <RecipeModal
                    meal={meal}
                    onClose={handleCloseModal}
                    lang={lang}
                />
            )}
        </section>
    );
}
