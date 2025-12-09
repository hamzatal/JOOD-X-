import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import axios from "axios";
import { useLang } from "@/context/LangContext";
import { AnimatePresence } from "framer-motion";
import HeroSection from "@/components/meal-planner/HeroSection";
import WeeklyStats from "@/components/meal-planner/WeeklyStats";
import FilterBar from "@/components/meal-planner/FilterBar";
import DayCard from "@/components/meal-planner/DayCard";
import MealModal from "@/components/meal-planner/MealModal";
import ShoppingList from "@/components/meal-planner/ShoppingList";
import NutritionSummary from "@/components/meal-planner/NutritionSummary";
import PrintView from "@/components/meal-planner/PrintView";
import TipsSection from "@/components/meal-planner/TipsSection";

export default function MealPlannerPage() {
    const { lang } = useLang();
    const [plan, setPlan] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedMeal, setSelectedMeal] = useState(null);
    const [error, setError] = useState(null);
    const [filterDiet, setFilterDiet] = useState("all");
    const [favorites, setFavorites] = useState([]);
    const [showShoppingList, setShowShoppingList] = useState(false);
    const [showNutritionSummary, setShowNutritionSummary] = useState(false);
    const [showPrintView, setShowPrintView] = useState(false);

    const t = (ar, en) => (lang === "ar" ? ar : en);

    useEffect(() => {
        fetchPlan();
        loadFavorites();
    }, [lang]);

    const loadFavorites = () => {
        const savedFavorites = localStorage.getItem("mealFavorites");
        if (savedFavorites) {
            try {
                setFavorites(JSON.parse(savedFavorites));
            } catch (e) {
                console.error("Failed to parse favorites", e);
            }
        }
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
                {
                    timeout: 60000, // ⬅️ زيادة إلى 60 ثانية
                    onDownloadProgress: (progressEvent) => {
                        // Optional: يمكنك إضافة progress indicator هنا
                        console.log("Loading...", progressEvent);
                    },
                }
            );

            if (res.data && res.data.plan) {
                const enrichedPlan = enrichPlanWithNutrition(res.data.plan);
                setPlan(enrichedPlan);
            } else {
                setPlan([]);
            }
        } catch (err) {
            console.error(err);

            // رسائل خطأ محسّنة
            if (err.code === "ECONNABORTED") {
                setError(
                    lang === "ar"
                        ? "الطلب استغرق وقتًا طويلاً. يرجى المحاولة مرة أخرى أو استخدام البيانات المخزنة."
                        : "Request took too long. Please try again or use cached data."
                );
            } else {
                setError(
                    lang === "ar"
                        ? "فشل جلب خطة الوجبات. يرجى التحقق من الاتصال بالإنترنت."
                        : "Failed to fetch meal plan. Please check your internet connection."
                );
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

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
            mealType === "breakfast" ? 2.5 : mealType === "lunch" ? 4.5 : 3.5;
        const variation = Math.random() * 0.3 - 0.15;

        return {
            ...meal,
            mealType,
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

    const toggleFavorite = (mealId) => {
        const newFavorites = favorites.includes(mealId)
            ? favorites.filter((id) => id !== mealId)
            : [...favorites, mealId];
        setFavorites(newFavorites);
        localStorage.setItem("mealFavorites", JSON.stringify(newFavorites));
    };

    const openMeal = (meal) => {
        setSelectedMeal(meal);
    };

    const closeMeal = () => {
        setSelectedMeal(null);
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

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-gray-200">
            <Navbar />
            <HeroSection
                lang={lang}
                onRefresh={() => fetchPlan(true)}
                loading={loading}
                refreshing={refreshing}
            />
            <WeeklyStats plan={filteredPlan} lang={lang} />
            <FilterBar
                lang={lang}
                filterDiet={filterDiet}
                setFilterDiet={setFilterDiet}
                onRefresh={() => fetchPlan(true)}
                refreshing={refreshing}
                onShowShoppingList={() => setShowShoppingList(true)}
                onShowNutritionSummary={() => setShowNutritionSummary(true)}
                onPrint={() => setShowPrintView(true)}
            />
            <section className="py-10 px-4">
                <div className="max-w-6xl mx-auto">
                    {loading ? (
                        <div className="py-32 text-center">
                            <div className="w-16 h-16 border-4 border-t-green-500 border-r-blue-500 border-b-purple-500 border-l-pink-500 rounded-full mx-auto mb-6 animate-spin"></div>
                            <p className="text-lg text-gray-400">
                                {t(
                                    "جاري توليد خطة مخصصة لك...",
                                    "Generating your personalized plan..."
                                )}
                            </p>
                        </div>
                    ) : error ? (
                        <div className="bg-red-900/30 backdrop-blur-lg p-8 rounded-2xl border border-red-700/50 text-center">
                            <p className="text-red-300 text-lg mb-4">{error}</p>
                            <button
                                onClick={() => fetchPlan(false)}
                                className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-xl font-semibold transition-all"
                            >
                                {t("إعادة المحاولة", "Try Again")}
                            </button>
                        </div>
                    ) : filteredPlan.length === 0 ? (
                        <div className="p-12 bg-gray-800/30 backdrop-blur-lg rounded-2xl text-center border border-gray-700">
                            <p className="text-gray-400 text-lg">
                                {t(
                                    "لا توجد وجبات متاحة لهذا الفلتر",
                                    "No meals available for this filter"
                                )}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {" "}
                            <AnimatePresence>
                                {filteredPlan.map((day, idx) => (
                                    <DayCard
                                        key={idx}
                                        day={day}
                                        dayIndex={idx}
                                        lang={lang}
                                        onMealClick={openMeal}
                                    />
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </section>
            <TipsSection lang={lang} />
            <Footer />
            <Footer />
            <AnimatePresence>
                {selectedMeal && (
                    <MealModal
                        meal={selectedMeal}
                        onClose={closeMeal}
                        lang={lang}
                        isFavorite={favorites.includes(
                            selectedMeal.id || selectedMeal.idMeal
                        )}
                        onToggleFavorite={() =>
                            toggleFavorite(
                                selectedMeal.id || selectedMeal.idMeal
                            )
                        }
                    />
                )}

                {showShoppingList && (
                    <ShoppingList
                        plan={filteredPlan}
                        lang={lang}
                        onClose={() => setShowShoppingList(false)}
                    />
                )}

                {showNutritionSummary && (
                    <NutritionSummary
                        plan={filteredPlan}
                        lang={lang}
                        onClose={() => setShowNutritionSummary(false)}
                    />
                )}

                {showPrintView && (
                    <PrintView
                        plan={filteredPlan}
                        lang={lang}
                        onClose={() => setShowPrintView(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
