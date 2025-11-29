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
    const [visibleCount, setVisibleCount] = useState(4);
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
            console.log("Language changed, fetching new recipes...");
            fetchRecipes(true);
            previousLang.current = lang;
        }
    }, [lang]);

    useEffect(() => {
        const updateCount = () => {
            const w = window.innerWidth;
            if (w >= 1280) setVisibleCount(5);
            else if (w >= 1024) setVisibleCount(4);
            else if (w >= 768) setVisibleCount(3);
            else setVisibleCount(2);
        };

        updateCount();
        window.addEventListener("resize", updateCount);
        return () => window.removeEventListener("resize", updateCount);
    }, []);

    useEffect(() => {
        if (isPaused || trending.length <= 1) return;

        const id = setInterval(() => {
            setActiveIndex((i) => (i + 1) % trending.length);
        }, 9000); 

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

    if (loading) {
        return (
            <section className="relative py-20 bg-gradient-to-b from-gray-900 via-black to-gray-900 flex items-center justify-center min-h-[600px]">
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
            <section className="relative py-20 bg-gradient-to-b from-gray-900 via-black to-gray-900 flex items-center justify-center min-h-[600px]">
                <p className="text-gray-400">
                    {t("لا توجد وصفات متاحة", "No recipes available")}
                </p>
            </section>
        );
    }

    // FIXED: Proper fallback logic
    const displayTitle =
        lang === "ar" && meal.strMealAr ? meal.strMealAr : meal.strMeal;

    const displayCategory =
        lang === "ar" && meal.strCategoryAr
            ? meal.strCategoryAr
            : meal.strCategory;

    const displayArea =
        lang === "ar" && meal.strAreaAr ? meal.strAreaAr : meal.strArea;

    const displayInstructions =
        lang === "ar" && meal.strInstructionsAr
            ? meal.strInstructionsAr
            : meal.strInstructions;

    return (
        <section className="relative w-full py-12 px-4 md:px-8 bg-gradient-to-b from-gray-900 via-black to-gray-900 overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
                <div className="absolute top-20 left-10 w-96 h-96 bg-green-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
                    {/* Content Side */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={`content-${activeIndex}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.5 }}
                            className={`space-y-6 ${
                                lang === "ar"
                                    ? "text-right order-2 md:order-2"
                                    : "text-left order-1 md:order-1"
                            }`}
                        >
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
                                    className={`flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 rounded-lg transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${
                                        lang === "ar" ? "mr-auto" : "ml-auto"
                                    }`}
                                >
                                    <RefreshCw
                                        className={`w-4 h-4 text-white ${
                                            refreshing ? "animate-spin" : ""
                                        }`}
                                    />
                                    <span className="text-xs font-semibold text-white">
                                        {t("وصفات جديدة !", "New Recipes!")}
                                    </span>
                                </motion.button>

                                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600/20 to-amber-600/20 px-3 py-1.5 rounded-full text-sm text-green-300 border border-green-500/30">
                                    <Star className="w-4 h-4" />
                                    {t("الأكثر شعبية", "Most Popular")}
                                </div>
                                <div className="inline-flex items-center gap-2 bg-gray-800/50 px-3 py-1.5 rounded-full text-sm text-gray-300 border border-gray-700/50">
                                    <span>#{activeIndex + 1}</span>
                                </div>
                            </div>

                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-white">
                                {displayTitle}
                            </h1>

                            {/* FIXED: Proper spacing between badges */}
                            <div
                                className={`flex gap-3 flex-wrap ${
                                    lang === "ar"
                                        ? "justify-end"
                                        : "justify-start"
                                }`}
                            >
                                <span className="flex items-center gap-2 px-4 py-2 bg-gray-800/70 rounded-full border border-gray-700 text-sm text-gray-200">
                                    <ChefHat className="w-4 h-4 text-green-400" />
                                    <span>{displayCategory}</span>
                                </span>
                                <span className="flex items-center gap-2 px-4 py-2 bg-gray-800/70 rounded-full border border-gray-700 text-sm text-gray-200">
                                    <Globe className="w-4 h-4 text-amber-400" />
                                    <span>{displayArea}</span>
                                </span>
                            </div>

                            <p className="text-gray-300 text-base leading-relaxed line-clamp-3">
                                {displayInstructions?.substring(0, 180)}...
                            </p>

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
                                    className={`group inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 rounded-xl text-white font-semibold hover:shadow-lg hover:shadow-green-500/30 transition-all ${
                                        lang === "ar" ? "flex-row-reverse" : ""
                                    }`}
                                >
                                    {t("عرض الوصفة", "View Recipe")}
                                    <ArrowRight
                                        className={`w-5 h-5 group-hover:${
                                            lang === "ar"
                                                ? "-translate-x-1"
                                                : "translate-x-1"
                                        } transition`}
                                    />
                                </motion.button>
                            </div>

                            {/* Thumbnails carousel */}
                            <div className="relative mt-10 w-full">
                                <button
                                    onClick={() =>
                                        activeIndex > 0 &&
                                        setActiveIndex(activeIndex - 1)
                                    }
                                    disabled={activeIndex === 0}
                                    className={`absolute ${
                                        lang === "ar" ? "right-0" : "left-0"
                                    } top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full flex items-center justify-center bg-gray-800/90 backdrop-blur-sm transition hover:bg-gray-700/90 disabled:opacity-30 disabled:cursor-not-allowed border border-gray-700`}
                                >
                                    {lang === "ar" ? (
                                        <ChevronRight className="w-5 h-5" />
                                    ) : (
                                        <ChevronLeft className="w-5 h-5" />
                                    )}
                                </button>

                                <button
                                    onClick={() =>
                                        activeIndex < trending.length - 1 &&
                                        setActiveIndex(activeIndex + 1)
                                    }
                                    disabled={
                                        activeIndex >= trending.length - 1
                                    }
                                    className={`absolute ${
                                        lang === "ar" ? "left-0" : "right-0"
                                    } top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full flex items-center justify-center bg-gray-800/90 backdrop-blur-sm transition hover:bg-gray-700/90 disabled:opacity-30 disabled:cursor-not-allowed border border-gray-700`}
                                >
                                    {lang === "ar" ? (
                                        <ChevronLeft className="w-5 h-5" />
                                    ) : (
                                        <ChevronRight className="w-5 h-5" />
                                    )}
                                </button>

                                <div className="overflow-hidden px-11">
                                    <div className="flex gap-3">
                                        {trending.map((item, idx) => {
                                            let offset = idx - activeIndex;
                                            const isVisible =
                                                Math.abs(offset) < visibleCount;

                                            return (
                                                <button
                                                    key={item.idMeal}
                                                    onClick={() =>
                                                        setActiveIndex(idx)
                                                    }
                                                    className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                                                        idx === activeIndex
                                                            ? "border-green-500 shadow-lg scale-105 ring-2 ring-green-500/50 opacity-100"
                                                            : "border-gray-700 opacity-60 hover:opacity-100 hover:border-amber-500"
                                                    } ${
                                                        !isVisible
                                                            ? "hidden"
                                                            : ""
                                                    }`}
                                                >
                                                    <img
                                                        src={item.strMealThumb}
                                                        alt={item.strMeal}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Image Side */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={`image-${activeIndex}`}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.5 }}
                            className={`flex justify-center ${
                                lang === "ar"
                                    ? "order-1 md:order-1"
                                    : "order-2 md:order-2"
                            }`}
                        >
                            <div className="w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-gray-700/50 hover:border-gray-600/50 transition-all">
                                <div className="relative group">
                                    <img
                                        src={meal.strMealThumb}
                                        alt={displayTitle}
                                        className="w-full h-72 md:h-96 object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                                    <div
                                        className={`absolute top-3 ${
                                            lang === "ar" ? "left-3" : "right-3"
                                        } bg-gradient-to-r from-green-500 to-amber-500 text-white px-3 py-1.5 rounded-full flex items-center gap-2 text-xs font-bold shadow-lg`}
                                    >
                                        <TrendingUp className="w-4 h-4" />#
                                        {activeIndex + 1}
                                    </div>

                                    <div
                                        className={`absolute bottom-0 left-0 right-0 p-5 ${
                                            lang === "ar"
                                                ? "text-right"
                                                : "text-left"
                                        }`}
                                    >
                                        <h3 className="text-xl font-bold text-white mb-2">
                                            {displayTitle}
                                        </h3>
                                        {/* FIXED: Better layout with proper spacing */}
                                        <div
                                            className={`flex items-center gap-4 text-sm text-gray-200 ${
                                                lang === "ar"
                                                    ? "justify-end"
                                                    : "justify-start"
                                            }`}
                                        >
                                            <div className="flex items-center gap-1.5">
                                                <ChefHat className="w-4 h-4 text-green-400" />
                                                <span>{displayCategory}</span>
                                            </div>
                                            <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                                            <div className="flex items-center gap-1.5">
                                                <Globe className="w-4 h-4 text-amber-400" />
                                                <span>{displayArea}</span>
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
