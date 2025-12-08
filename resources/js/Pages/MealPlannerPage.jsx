import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import axios from "axios";
import { useLang } from "@/context/LangContext";
import MealModal from "@/components/meal-planner/MealModal";
import { motion, AnimatePresence } from "framer-motion";
import {
    Leaf as LeafIcon,
    ChefHat as ChefHatIcon,
    Activity as ActivityIcon,
    HeartPulse as HeartPulseIcon,
    MessageCircle as MessageCircleIcon,
    Calendar as CalendarIcon,
    Clock as ClockIcon,
    Flame as FlameIcon,
    Star as StarIcon,
    RefreshCw as RefreshCwIcon,
    Sparkles as SparklesIcon,
    TrendingUp as TrendingUpIcon,
    Award as AwardIcon,
    UtensilsCrossed,
    Salad,
    Beef,
    DollarSign,
} from "lucide-react";

const PLACEHOLDER_IMAGE =
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop";

export default function MealPlannerPage() {
    const { lang } = useLang();
    const [plan, setPlan] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selected, setSelected] = useState(null);
    const [error, setError] = useState(null);
    const [filterDiet, setFilterDiet] = useState("all");
    const [favorites, setFavorites] = useState([]);
    const [weeklyStats, setWeeklyStats] = useState({
        totalCalories: 0,
        avgProtein: 0,
        totalMeals: 21,
    });

    useEffect(() => {
        fetchPlan();
        const savedFavorites = localStorage.getItem("mealFavorites");
        if (savedFavorites) {
            try {
                setFavorites(JSON.parse(savedFavorites));
            } catch (e) {
                console.error("Failed to parse favorites", e);
            }
        }
    }, [lang]);

    const enrichPlanWithNutrition = (planData) => {
        return planData.map((day) => ({
            ...day,
            breakfast: day.breakfast
                ? enrichMeal(day.breakfast, "breakfast")
                : null,
            lunch: day.lunch ? enrichMeal(day.lunch, "lunch") : null,
            dinner: day.dinner ? enrichMeal(day.dinner, "dinner") : null,
        }));
    };

    const enrichMeal = (meal, mealType) => {
        const baseCalories =
            mealType === "breakfast" ? 350 : mealType === "lunch" ? 550 : 500;
        const baseProtein =
            mealType === "breakfast" ? 15 : mealType === "lunch" ? 30 : 25;
        const baseCarbs =
            mealType === "breakfast" ? 45 : mealType === "lunch" ? 60 : 55;
        const baseFat =
            mealType === "breakfast" ? 12 : mealType === "lunch" ? 18 : 20;
        const baseCost =
            mealType === "breakfast" ? 2 : mealType === "lunch" ? 4 : 3.5;
        const variation = Math.random() * 0.3 - 0.15;

        return {
            ...meal,
            nutrition: {
                calories: Math.round(baseCalories * (1 + variation)),
                protein: Math.round(baseProtein * (1 + variation)),
                carbs: Math.round(baseCarbs * (1 + variation)),
                fat: Math.round(baseFat * (1 + variation)),
            },
            cost: parseFloat((baseCost * (1 + variation)).toFixed(2)),
            prepTime: Math.round(25 + Math.random() * 40),
        };
    };

    const fetchPlan = async (refresh = false) => {
        setError(null);
        if (refresh) setRefreshing(true);
        else setLoading(true);

        try {
            const res = await axios.get(
                `/api/meal-planner/generate?lang=${lang}&refresh=${
                    refresh ? "true" : "false"
                }`,
                { timeout: 30000 }
            );

            if (res.data && res.data.plan) {
                const enrichedPlan = enrichPlanWithNutrition(res.data.plan);
                setPlan(enrichedPlan);
                calculateWeeklyStats(enrichedPlan);
            } else {
                setPlan([]);
            }
        } catch (err) {
            console.error(err);
            setError(
                lang === "ar"
                    ? "فشل جلب خطة الوجبات. يرجى المحاولة مرة أخرى."
                    : "Failed to fetch meal plan. Please try again."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const calculateWeeklyStats = (planData) => {
        let totalCalories = 0;
        let totalProtein = 0;
        let mealCount = 0;

        planData.forEach((day) => {
            ["breakfast", "lunch", "dinner"].forEach((mealType) => {
                if (day[mealType]?.nutrition) {
                    totalCalories += day[mealType].nutrition.calories;
                    totalProtein += day[mealType].nutrition.protein;
                    mealCount++;
                }
            });
        });

        setWeeklyStats({
            totalCalories,
            avgProtein:
                mealCount > 0 ? Math.round(totalProtein / mealCount) : 0,
            totalMeals: mealCount,
        });
    };

    const openMeal = (meal) => {
        setSelected(meal);
        document.body.style.overflow = "hidden";
    };

    const closeMeal = () => {
        setSelected(null);
        document.body.style.overflow = "unset";
    };

    const toggleFavorite = (mealId) => {
        const newFavorites = favorites.includes(mealId)
            ? favorites.filter((id) => id !== mealId)
            : [...favorites, mealId];
        setFavorites(newFavorites);
        localStorage.setItem("mealFavorites", JSON.stringify(newFavorites));
    };

    const t = (ar, en) => (lang === "ar" ? ar : en);

    const getMealIcon = (slot) => {
        const icons = { breakfast: "☀️", lunch: "🍽️", dinner: "🌙" };
        return icons[slot] || "🍴";
    };

    const getFilteredPlan = () => {
        if (filterDiet === "all") return plan;
        return plan
            .map((day) => ({
                ...day,
                breakfast: filterMeal(day.breakfast),
                lunch: filterMeal(day.lunch),
                dinner: filterMeal(day.dinner),
            }))
            .filter((day) => day.breakfast || day.lunch || day.dinner);
    };

    const filterMeal = (meal) => {
        if (!meal) return null;
        const mealName = (meal.name || meal.strMeal || "").toLowerCase();

        if (filterDiet === "vegan") {
            const nonVeganKeywords = [
                "chicken",
                "beef",
                "meat",
                "fish",
                "egg",
                "دجاج",
                "لحم",
                "سمك",
                "بيض",
            ];
            if (nonVeganKeywords.some((keyword) => mealName.includes(keyword)))
                return null;
        } else if (filterDiet === "keto") {
            if (meal.nutrition && meal.nutrition.carbs > 30) return null;
        } else if (filterDiet === "protein") {
            if (meal.nutrition && meal.nutrition.protein < 20) return null;
        }
        return meal;
    };

    const filteredPlan = getFilteredPlan();

    const handleImageError = (e) => {
        e.target.onerror = null;
        e.target.src = PLACEHOLDER_IMAGE;
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-gray-200">
            <Navbar />

            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white py-16 px-6">
                <div className="absolute inset-0 overflow-hidden opacity-10">
                    <motion.div
                        className="absolute top-10 left-10"
                        animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
                        transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    >
                        <LeafIcon size={60} />
                    </motion.div>
                    <motion.div
                        className="absolute top-20 right-20"
                        animate={{ y: [0, 20, 0], rotate: [0, -10, 0] }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 0.5,
                        }}
                    >
                        <ChefHatIcon size={80} />
                    </motion.div>
                    <motion.div
                        className="absolute bottom-20 left-1/4"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{
                            duration: 6,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    >
                        <ActivityIcon size={70} />
                    </motion.div>
                    <motion.div
                        className="absolute bottom-10 right-1/3"
                        animate={{ y: [0, -15, 0] }}
                        transition={{
                            duration: 3.5,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    >
                        <HeartPulseIcon size={90} />
                    </motion.div>
                </div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center"
                    >
                        <div className="flex items-center justify-center gap-4 mb-4">
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
                                <HeartPulseIcon
                                    size={40}
                                    className="text-red-200"
                                />
                            </motion.div>
                            <h1 className="text-4xl md:text-6xl font-bold">
                                {t(
                                    "مكتبة الوصفات الأسبوعية",
                                    "Weekly Recipe Library"
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
                                <ChefHatIcon
                                    size={40}
                                    className="text-amber-200"
                                />
                            </motion.div>
                        </div>

                        <p className="text-lg md:text-xl text-green-100 max-w-3xl mx-auto mb-6">
                            {t(
                                "وصفات شهية | سهلة التحضير | من مختلف المطابخ العالمية",
                                "Delicious recipes | Easy to prepare | From various world cuisines"
                            )}
                        </p>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => fetchPlan(true)}
                            disabled={loading || refreshing}
                            className="px-8 py-3 bg-white text-green-700 rounded-2xl font-bold flex items-center gap-2 shadow-xl mx-auto hover:shadow-2xl transition-all disabled:opacity-50"
                        >
                            {loading || refreshing ? (
                                <RefreshCwIcon
                                    size={20}
                                    className="animate-spin"
                                />
                            ) : (
                                <SparklesIcon size={20} />
                            )}
                            {t("وصفات جديدة!", "New Recipes!")}
                        </motion.button>
                    </motion.div>
                </div>

                <div className="absolute bottom-0 left-0 right-0">
                    <svg
                        viewBox="0 0 1440 80"
                        className="w-full h-12 fill-gray-950"
                    >
                        <path d="M0,40L48,45C96,50,192,60,288,60C384,60,480,50,576,45C672,40,768,40,864,45C960,50,1056,60,1152,60C1248,60,1344,50,1392,45L1440,40L1440,80L0,80Z"></path>
                    </svg>
                </div>
            </section>

            {/* Weekly Stats Dashboard */}
            <section className="py-8 px-4 -mt-4">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-gradient-to-br from-orange-900/40 to-red-900/40 backdrop-blur-lg p-6 rounded-2xl border border-orange-700/30 shadow-xl"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-orange-300 text-sm mb-1 font-medium">
                                        {t("إجمالي السعرات", "Total Calories")}
                                    </p>
                                    <p className="text-3xl font-bold text-white">
                                        {weeklyStats.totalCalories.toLocaleString()}
                                    </p>
                                    <p className="text-xs text-orange-200/70 mt-1">
                                        {t("لمدة أسبوع", "Per Week")}
                                    </p>
                                </div>
                                <div className="p-4 bg-orange-500/20 rounded-2xl">
                                    <FlameIcon
                                        size={40}
                                        className="text-orange-400"
                                    />
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-gradient-to-br from-blue-900/40 to-cyan-900/40 backdrop-blur-lg p-6 rounded-2xl border border-blue-700/30 shadow-xl"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-300 text-sm mb-1 font-medium">
                                        {t("متوسط البروتين", "Avg Protein")}
                                    </p>
                                    <p className="text-3xl font-bold text-white">
                                        {weeklyStats.avgProtein}g
                                    </p>
                                    <p className="text-xs text-blue-200/70 mt-1">
                                        {t("لكل وجبة", "Per Meal")}
                                    </p>
                                </div>
                                <div className="p-4 bg-blue-500/20 rounded-2xl">
                                    <TrendingUpIcon
                                        size={40}
                                        className="text-blue-400"
                                    />
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 backdrop-blur-lg p-6 rounded-2xl border border-green-700/30 shadow-xl"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-green-300 text-sm mb-1 font-medium">
                                        {t("الوجبات المخططة", "Planned Meals")}
                                    </p>
                                    <p className="text-3xl font-bold text-white">
                                        {weeklyStats.totalMeals}
                                    </p>
                                    <p className="text-xs text-green-200/70 mt-1">
                                        {t(
                                            "7 أيام × 3 وجبات",
                                            "7 Days × 3 Meals"
                                        )}
                                    </p>
                                </div>
                                <div className="p-4 bg-green-500/20 rounded-2xl">
                                    <AwardIcon
                                        size={40}
                                        className="text-green-400"
                                    />
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-10 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl shadow-lg">
                                <CalendarIcon
                                    size={28}
                                    className="text-white"
                                />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">
                                    {t("خطتك الأسبوعية", "Your Weekly Plan")}
                                </h2>
                                <p className="text-sm text-gray-400">
                                    {t("مخصصة لك", "Personalized for you")}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 flex-wrap justify-center">
                            <div className="flex items-center gap-2 bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl px-2 py-2 rounded-2xl border border-gray-700/50 shadow-lg">
                                <button
                                    onClick={() => setFilterDiet("all")}
                                    className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center gap-2 ${
                                        filterDiet === "all"
                                            ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg"
                                            : "text-gray-400 hover:text-white"
                                    }`}
                                >
                                    <UtensilsCrossed size={16} />
                                    {t("الكل", "All")}
                                </button>

                                <button
                                    onClick={() => setFilterDiet("vegan")}
                                    className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center gap-2 ${
                                        filterDiet === "vegan"
                                            ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg"
                                            : "text-gray-400 hover:text-white"
                                    }`}
                                >
                                    <Salad size={16} />
                                    {t("نباتي", "Vegan")}
                                </button>

                                <button
                                    onClick={() => setFilterDiet("keto")}
                                    className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center gap-2 ${
                                        filterDiet === "keto"
                                            ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                                            : "text-gray-400 hover:text-white"
                                    }`}
                                >
                                    <FlameIcon size={16} />
                                    {t("كيتو", "Keto")}
                                </button>

                                <button
                                    onClick={() => setFilterDiet("protein")}
                                    className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center gap-2 ${
                                        filterDiet === "protein"
                                            ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg"
                                            : "text-gray-400 hover:text-white"
                                    }`}
                                >
                                    <Beef size={16} />
                                    {t("بروتين", "Protein")}
                                </button>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => fetchPlan(true)}
                                disabled={refreshing}
                                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl font-semibold flex items-center gap-2 shadow-lg hover:shadow-green-500/50 transition-all disabled:opacity-50"
                            >
                                <RefreshCwIcon
                                    size={18}
                                    className={refreshing ? "animate-spin" : ""}
                                />
                                {refreshing
                                    ? t("جاري التحديث...", "Refreshing...")
                                    : t("تحديث", "Refresh")}
                            </motion.button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="py-32 text-center">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{
                                    duration: 1,
                                    repeat: Infinity,
                                    ease: "linear",
                                }}
                                className="w-16 h-16 border-4 border-t-green-500 border-r-blue-500 border-b-purple-500 border-l-pink-500 rounded-full mx-auto mb-6"
                            ></motion.div>
                            <p className="text-lg text-gray-400">
                                {t(
                                    "جاري توليد خطة مخصصة لك...",
                                    "Generating your personalized plan..."
                                )}
                            </p>
                        </div>
                    ) : error ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-red-900/30 backdrop-blur-lg p-8 rounded-2xl border border-red-700/50 text-center"
                        >
                            <p className="text-red-300 text-lg mb-4">{error}</p>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => fetchPlan(false)}
                                className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-xl font-semibold transition-all"
                            >
                                {t("إعادة المحاولة", "Try Again")}
                            </motion.button>
                        </motion.div>
                    ) : filteredPlan.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="p-12 bg-gray-800/30 backdrop-blur-lg rounded-2xl text-center border border-gray-700"
                        >
                            <p className="text-gray-400 text-lg">
                                {t(
                                    "لا توجد وجبات متاحة لهذا الفلتر",
                                    "No meals available for this filter"
                                )}
                            </p>
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <AnimatePresence>
                                {filteredPlan.map((day, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl p-5 rounded-3xl border border-gray-700/50 hover:border-green-500/50 transition-all shadow-xl hover:shadow-2xl"
                                    >
                                        <div className="flex items-center justify-between mb-5">
                                            <h3 className="font-bold text-xl bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
                                                {day.day}
                                            </h3>
                                            <span className="px-3 py-1 bg-gradient-to-r from-purple-600/30 to-pink-600/30 rounded-full text-xs font-semibold border border-purple-500/30">
                                                {t("اليوم", "Day")} {idx + 1}
                                            </span>
                                        </div>

                                        <div className="space-y-3">
                                            {[
                                                "breakfast",
                                                "lunch",
                                                "dinner",
                                            ].map((slot) => {
                                                const meal = day[slot];
                                                if (!meal) return null;

                                                const title =
                                                    meal.name ||
                                                    meal.strMeal ||
                                                    "Meal";
                                                const mealId =
                                                    meal.id ||
                                                    meal.idMeal ||
                                                    `${idx}-${slot}`;
                                                const isFavorite =
                                                    favorites.includes(mealId);
                                                const image =
                                                    meal.image ||
                                                    meal.strMealThumb ||
                                                    PLACEHOLDER_IMAGE;

                                                return (
                                                    <motion.div
                                                        key={slot}
                                                        whileHover={{
                                                            scale: 1.02,
                                                        }}
                                                        className="group relative flex flex-col bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm p-4 rounded-2xl border border-gray-700/50 hover:border-green-500/70 transition-all cursor-pointer overflow-hidden"
                                                        onClick={() =>
                                                            openMeal(meal)
                                                        }
                                                    >
                                                        <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 via-green-500/10 to-green-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>

                                                        <div className="relative flex items-start gap-3 mb-3">
                                                            <div className="relative flex-shrink-0">
                                                                <img
                                                                    src={image}
                                                                    alt={title}
                                                                    className="w-24 h-20 object-cover rounded-xl border-2 border-gray-700/50 group-hover:border-green-500/50 transition-all"
                                                                    onError={
                                                                        handleImageError
                                                                    }
                                                                    loading="lazy"
                                                                />
                                                                <span className="absolute -top-2 -right-2 text-2xl bg-gray-900/90 rounded-full w-10 h-10 flex items-center justify-center border-2 border-gray-700">
                                                                    {getMealIcon(
                                                                        slot
                                                                    )}
                                                                </span>
                                                            </div>

                                                            <div className="flex-1 min-w-0">
                                                                <div className="text-sm font-bold text-gray-100 mb-1 line-clamp-2">
                                                                    {title}
                                                                </div>
                                                                <div className="flex items-center gap-2 text-xs mb-2">
                                                                    <span className="px-2 py-0.5 bg-blue-600/30 text-blue-300 rounded-md border border-blue-500/30">
                                                                        {t(
                                                                            slot ===
                                                                                "breakfast"
                                                                                ? "إفطار"
                                                                                : slot ===
                                                                                  "lunch"
                                                                                ? "غداء"
                                                                                : "عشاء",
                                                                            slot
                                                                        )}
                                                                    </span>
                                                                </div>

                                                                <motion.button
                                                                    whileHover={{
                                                                        scale: 1.15,
                                                                    }}
                                                                    whileTap={{
                                                                        scale: 0.9,
                                                                    }}
                                                                    onClick={(
                                                                        e
                                                                    ) => {
                                                                        e.stopPropagation();
                                                                        toggleFavorite(
                                                                            mealId
                                                                        );
                                                                    }}
                                                                    className="absolute top-2 right-2"
                                                                >
                                                                    <StarIcon
                                                                        size={
                                                                            20
                                                                        }
                                                                        className={`transition-all ${
                                                                            isFavorite
                                                                                ? "fill-yellow-400 text-yellow-400"
                                                                                : "text-gray-500 hover:text-yellow-400"
                                                                        }`}
                                                                    />
                                                                </motion.button>
                                                            </div>
                                                        </div>

                                                        {meal.nutrition && (
                                                            <div className="relative grid grid-cols-4 gap-2 text-xs mb-3">
                                                                <div className="bg-orange-900/30 backdrop-blur-sm p-2 rounded-lg border border-orange-700/30 text-center">
                                                                    <FlameIcon
                                                                        size={
                                                                            14
                                                                        }
                                                                        className="mx-auto text-orange-400 mb-1"
                                                                    />
                                                                    <div className="font-bold text-white">
                                                                        {
                                                                            meal
                                                                                .nutrition
                                                                                .calories
                                                                        }
                                                                    </div>
                                                                    <div className="text-orange-300/70 text-[10px]">
                                                                        {t(
                                                                            "سعرة",
                                                                            "cal"
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="bg-blue-900/30 backdrop-blur-sm p-2 rounded-lg border border-blue-700/30 text-center">
                                                                    <Beef
                                                                        size={
                                                                            14
                                                                        }
                                                                        className="mx-auto text-blue-400 mb-1"
                                                                    />
                                                                    <div className="font-bold text-white">
                                                                        {
                                                                            meal
                                                                                .nutrition
                                                                                .protein
                                                                        }
                                                                        g
                                                                    </div>
                                                                    <div className="text-blue-300/70 text-[10px]">
                                                                        {t(
                                                                            "بروتين",
                                                                            "protein"
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="bg-purple-900/30 backdrop-blur-sm p-2 rounded-lg border border-purple-700/30 text-center">
                                                                    <div className="text-xl mx-auto mb-1">
                                                                        🍞
                                                                    </div>
                                                                    <div className="font-bold text-white">
                                                                        {
                                                                            meal
                                                                                .nutrition
                                                                                .carbs
                                                                        }
                                                                        g
                                                                    </div>
                                                                    <div className="text-purple-300/70 text-[10px]">
                                                                        {t(
                                                                            "كارب",
                                                                            "carbs"
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="bg-yellow-900/30 backdrop-blur-sm p-2 rounded-lg border border-yellow-700/30 text-center">
                                                                    <div className="text-xl mx-auto mb-1">
                                                                        🥑
                                                                    </div>
                                                                    <div className="font-bold text-white">
                                                                        {
                                                                            meal
                                                                                .nutrition
                                                                                .fat
                                                                        }
                                                                        g
                                                                    </div>
                                                                    <div className="text-yellow-300/70 text-[10px]">
                                                                        {t(
                                                                            "دهون",
                                                                            "fat"
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}

                                                        <div className="relative flex items-center justify-between pt-3 border-t border-gray-700/50">
                                                            <div className="flex items-center gap-2 text-xs">
                                                                <ClockIcon
                                                                    size={14}
                                                                    className="text-gray-400"
                                                                />
                                                                <span className="text-gray-300">
                                                                    {meal.prepTime ||
                                                                        30}{" "}
                                                                    {t(
                                                                        "د",
                                                                        "min"
                                                                    )}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-1 px-3 py-1 bg-green-900/30 backdrop-blur-sm rounded-lg border border-green-700/30">
                                                                <DollarSign
                                                                    size={14}
                                                                    className="text-green-400"
                                                                />
                                                                <span className="font-bold text-white text-sm">
                                                                    {meal.cost ||
                                                                        3}
                                                                </span>
                                                                <span className="text-green-300/70 text-xs">
                                                                    {t(
                                                                        "د.أ",
                                                                        "JOD"
                                                                    )}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                );
                                            })}
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </section>

            {/* Tips Section */}
            <section className="py-12 px-4">
                <div className="max-w-6xl mx-auto">
                    <h3 className="text-2xl font-bold text-center mb-8 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                        {t("نصائح التغذية الذكية", "Smart Nutrition Tips")}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="bg-gradient-to-br from-green-900/40 to-emerald-800/40 backdrop-blur-lg p-6 rounded-2xl border border-green-700/30 shadow-lg"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-green-600/30 rounded-xl">
                                    <LeafIcon
                                        size={24}
                                        className="text-green-400"
                                    />
                                </div>
                                <h4 className="font-bold text-lg text-green-300">
                                    {t("التنوع الغذائي", "Dietary Variety")}
                                </h4>
                            </div>
                            <p className="text-sm text-green-100/80 leading-relaxed">
                                {t(
                                    "تجنب تكرار نفس البروتين يومياً. نوّع بين الدجاج، اللحم، والأسماك مع إضافة الخضروات الموسمية.",
                                    "Avoid repeating the same protein daily. Alternate between chicken, meat, and fish with seasonal vegetables."
                                )}
                            </p>
                        </motion.div>

                        <motion.div
                            whileHover={{ y: -5 }}
                            className="bg-gradient-to-br from-blue-900/40 to-cyan-800/40 backdrop-blur-lg p-6 rounded-2xl border border-blue-700/30 shadow-lg"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-blue-600/30 rounded-xl">
                                    <ClockIcon
                                        size={24}
                                        className="text-blue-400"
                                    />
                                </div>
                                <h4 className="font-bold text-lg text-blue-300">
                                    {t("التحضير المسبق", "Meal Prep")}
                                </h4>
                            </div>
                            <p className="text-sm text-blue-100/80 leading-relaxed">
                                {t(
                                    "حضّر وجباتك مسبقاً في عطلة نهاية الأسبوع. وفّر الوقت والمال واحصل على وجبات صحية جاهزة.",
                                    "Prep your meals on weekends. Save time and money while having healthy meals ready."
                                )}
                            </p>
                        </motion.div>

                        <motion.div
                            whileHover={{ y: -5 }}
                            className="bg-gradient-to-br from-purple-900/40 to-pink-800/40 backdrop-blur-lg p-6 rounded-2xl border border-purple-700/30 shadow-lg"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-purple-600/30 rounded-xl">
                                    <ActivityIcon
                                        size={24}
                                        className="text-purple-400"
                                    />
                                </div>
                                <h4 className="font-bold text-lg text-purple-300">
                                    {t("توازن السعرات", "Calorie Balance")}
                                </h4>
                            </div>
                            <p className="text-sm text-purple-100/80 leading-relaxed">
                                {t(
                                    "راقب سعراتك اليومية وتأكد من التوازن بين البروتين والكربوهيدرات والدهون الصحية.",
                                    "Monitor your daily calories and ensure balance between protein, carbs, and healthy fats."
                                )}
                            </p>
                        </motion.div>
                    </div>
                </div>
            </section>

            <Footer />

            <AnimatePresence>
                {selected && (
                    <MealModal
                        meal={selected}
                        onClose={closeMeal}
                        lang={lang}
                        isFavorite={favorites.includes(
                            selected.id || selected.idMeal
                        )}
                        onToggleFavorite={() =>
                            toggleFavorite(selected.id || selected.idMeal)
                        }
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
