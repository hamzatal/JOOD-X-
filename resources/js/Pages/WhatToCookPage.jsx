import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import axios from "axios";
import { useLang } from "@/context/LangContext";
import { motion } from "framer-motion";
import IngredientsInput from "@/components/what-to-cook/IngredientsInput";
import FiltersGrid from "@/components/what-to-cook/FiltersGrid";
import AdvancedFilters from "@/components/what-to-cook/AdvancedFilters";
import SearchSortBar from "@/components/what-to-cook/SearchSortBar";
import RecipeCard from "@/components/what-to-cook/RecipeCard";
import RecipeModal from "@/components/what-to-cook/RecipeModal";
import EmptyState from "@/components/what-to-cook/EmptyState";
import {
    X,
    Search,
    ChefHatIcon,
    SparklesIcon,
    UtensilsCrossedIcon,
    CookingPotIcon,
    AppleIcon,
    SaladIcon,
} from "lucide-react";

export default function WhatToCookPage() {
    const { lang } = useLang();

    const [ingredients, setIngredients] = useState("");
    const [mood, setMood] = useState("quick");
    const [time, setTime] = useState("30");
    const [difficulty, setDifficulty] = useState("easy");
    const [cuisine, setCuisine] = useState("all");
    const [dietary, setDietary] = useState("none");
    const [servings, setServings] = useState("4");
    const [loading, setLoading] = useState(false);
    const [recipes, setRecipes] = useState([]);
    const [error, setError] = useState("");
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [favorites, setFavorites] = useState([]);
    const [saved, setSaved] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [sortBy, setSortBy] = useState("relevance");

    const t = (ar, en) => (lang === "ar" ? ar : en);

    async function generate() {
        if (!ingredients.trim()) {
            setError(
                t(
                    "الرجاء إدخال المكونات التي لديك",
                    "Please enter the ingredients you have"
                )
            );
            return;
        }

        setError("");
        setLoading(true);

        try {
            const res = await axios.post(
                "/api/what-to-cook",
                {
                    lang,
                    ingredients,
                    mood,
                    time,
                    difficulty,
                    cuisine,
                    dietary,
                    servings,
                },
                {
                    timeout: 90000,
                }
            );

            if (res.data?.recipes) {
                setRecipes(res.data.recipes);
            } else {
                setRecipes([]);
            }
        } catch (err) {
            console.error("Error:", err);

            if (err.code === "ECONNABORTED") {
                setError(
                    t(
                        "الطلب استغرق وقتاً طويلاً. حاول مرة أخرى.",
                        "Request took too long. Please try again."
                    )
                );
            } else if (err.response?.status === 500) {
                setError(
                    t(
                        "خطأ في الخادم. حاول مرة أخرى بعد قليل.",
                        "Server error. Please try again in a moment."
                    )
                );
            } else {
                setError(
                    t(
                        "حدث خطأ أثناء توليد الوصفات. تأكد من اتصالك بالإنترنت.",
                        "Error while generating recipes. Check your internet connection."
                    )
                );
            }
        }

        setLoading(false);
    }

    const openModal = (recipe) => {
        setSelectedRecipe(recipe);
        setShowModal(true);
        document.body.style.overflow = "hidden";
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedRecipe(null);
        document.body.style.overflow = "unset";
    };

    const toggleFavorite = (recipeTitle) => {
        if (favorites.includes(recipeTitle)) {
            setFavorites(favorites.filter((f) => f !== recipeTitle));
        } else {
            setFavorites([...favorites, recipeTitle]);
        }
    };

    const toggleSaved = (recipeTitle) => {
        if (saved.includes(recipeTitle)) {
            setSaved(saved.filter((s) => s !== recipeTitle));
        } else {
            setSaved([...saved, recipeTitle]);
        }
    };

    const shareRecipe = async (recipe) => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: recipe.title,
                    text: recipe.description,
                });
            } catch (err) {
                console.log("Error sharing:", err);
            }
        } else {
            navigator.clipboard.writeText(
                `${recipe.title}\n${recipe.description}`
            );
            alert(t("تم النسخ!", "Copied!"));
        }
    };

    const printRecipe = (recipe) => {
        const printWindow = window.open("", "", "height=600,width=800");
        printWindow.document.write(`
            <html dir="${lang === "ar" ? "rtl" : "ltr"}">
            <head>
                <title>${recipe.title}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    h1 { color: #16a34a; }
                    img { max-width: 100%; height: auto; margin: 20px 0; }
                    .section { margin: 20px 0; }
                </style>
            </head>
            <body>
                <h1>${recipe.title}</h1>
                <img src="${recipe.image}" alt="${recipe.title}" />
                <div class="section">
                    <h2>${t("المكونات", "Ingredients")}</h2>
                    <ul>
                        ${recipe.ingredients
                            .map((ing) => `<li>${ing}</li>`)
                            .join("")}
                    </ul>
                </div>
                <div class="section">
                    <h2>${t("طريقة التحضير", "Instructions")}</h2>
                    <p>${recipe.instructions}</p>
                </div>
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    };

    const filteredRecipes = recipes
        .filter(
            (r) =>
                searchQuery === "" ||
                r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                r.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => {
            if (sortBy === "time")
                return parseInt(a.cookTime) - parseInt(b.cookTime);
            if (sortBy === "calories")
                return parseInt(a.calories) - parseInt(b.calories);
            return 0;
        });

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-gray-200">
            <Navbar />

            {/* Page Header */}
            <section className="relative overflow-hidden bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white py-20 px-6">
                <div className="absolute inset-0 overflow-hidden opacity-10">
                    <div className="absolute top-10 left-10 animate-float">
                        <CookingPotIcon size={60} />
                    </div>
                    <div className="absolute top-20 right-20 animate-float-delayed">
                        <ChefHatIcon size={80} />
                    </div>
                    <div className="absolute bottom-20 left-1/4 animate-float">
                        <UtensilsCrossedIcon size={70} />
                    </div>
                    <div className="absolute bottom-10 right-1/3 animate-float-delayed">
                        <AppleIcon size={90} />
                    </div>
                    <div className="absolute top-1/2 left-1/2 animate-float">
                        <SaladIcon size={65} />
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
                                <ChefHatIcon
                                    size={48}
                                    className="text-yellow-200"
                                />
                            </motion.div>
                            <h1 className="text-4xl md:text-6xl font-bold text-white">
                                {lang === "ar"
                                    ? "شو أطبخ اليوم؟"
                                    : "What Should I Cook?"}
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
                                <SparklesIcon
                                    size={48}
                                    className="text-amber-200"
                                />
                            </motion.div>
                        </div>

                        <p className="text-lg md:text-xl text-green-50 max-w-3xl mx-auto mb-4 leading-relaxed">
                            {lang === "ar"
                                ? "اكتب المكونات المتوفرة لديك ودع الذكاء الاصطناعي يقترح عليك وصفات عربية وعالمية شهية!"
                                : "Enter your available ingredients and let AI suggest delicious Arabic and international recipes!"}
                        </p>

                        <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20"
                            >
                                <UtensilsCrossedIcon size={20} />
                                <span className="text-sm font-medium">
                                    {lang === "ar"
                                        ? "وصفات متنوعة"
                                        : "Diverse Recipes"}
                                </span>
                            </motion.div>
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20"
                            >
                                <SparklesIcon size={20} />
                                <span className="text-sm font-medium">
                                    {lang === "ar"
                                        ? "ذكاء اصطناعي"
                                        : "AI Powered"}
                                </span>
                            </motion.div>
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20"
                            >
                                <CookingPotIcon size={20} />
                                <span className="text-sm font-medium">
                                    {lang === "ar"
                                        ? "سهل التحضير"
                                        : "Easy to Cook"}
                                </span>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>

                <div className="absolute bottom-0 left-0 right-0">
                    <svg
                        viewBox="0 0 1440 80"
                        className="w-full h-16 fill-gray-950"
                    >
                        <path d="M0,40L48,45C96,50,192,60,288,60C384,60,480,50,576,45C672,40,768,40,864,45C960,50,1056,60,1152,60C1248,60,1344,50,1392,45L1440,40L1440,80L0,80Z"></path>
                    </svg>
                </div>
            </section>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                {/* Form */}
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 sm:p-8 rounded-3xl border border-gray-700 shadow-2xl mb-12">
                    <div className="space-y-6">
                        <IngredientsInput
                            ingredients={ingredients}
                            setIngredients={setIngredients}
                            lang={lang}
                            t={t}
                        />

                        <FiltersGrid
                            mood={mood}
                            setMood={setMood}
                            time={time}
                            setTime={setTime}
                            difficulty={difficulty}
                            setDifficulty={setDifficulty}
                            servings={servings}
                            setServings={setServings}
                            lang={lang}
                            t={t}
                        />

                        <AdvancedFilters
                            showFilters={showFilters}
                            setShowFilters={setShowFilters}
                            cuisine={cuisine}
                            setCuisine={setCuisine}
                            dietary={dietary}
                            setDietary={setDietary}
                            lang={lang}
                            t={t}
                        />

                        {error && (
                            <div className="bg-red-900/30 border border-red-700 rounded-xl p-4 text-red-400 flex items-center gap-3">
                                <X className="w-5 h-5" />
                                {error}
                            </div>
                        )}

                        <button
                            onClick={generate}
                            disabled={loading}
                            className="w-full py-4 bg-gradient-to-r from-green-600 via-green-500 to-emerald-500 rounded-2xl text-white font-bold text-lg hover:shadow-lg hover:shadow-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    {t(
                                        "جاري البحث عن أفضل الوصفات...",
                                        "Finding best recipes..."
                                    )}
                                </>
                            ) : (
                                <>
                                    <Search className="w-5 h-5" />
                                    {t(
                                        "اقترح علي وصفات شهية",
                                        "Suggest delicious recipes"
                                    )}
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {recipes.length > 0 && (
                    <SearchSortBar
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        sortBy={sortBy}
                        setSortBy={setSortBy}
                        lang={lang}
                        t={t}
                    />
                )}

                {filteredRecipes.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredRecipes.map((r, i) => (
                            <RecipeCard
                                key={i}
                                recipe={r}
                                favorites={favorites}
                                saved={saved}
                                servings={servings}
                                toggleFavorite={toggleFavorite}
                                toggleSaved={toggleSaved}
                                openModal={openModal}
                                lang={lang}
                                t={t}
                            />
                        ))}
                    </div>
                )}

                {!loading && recipes.length === 0 && ingredients && (
                    <EmptyState lang={lang} t={t} />
                )}
            </main>

            {showModal && selectedRecipe && (
                <RecipeModal
                    recipe={selectedRecipe}
                    closeModal={closeModal}
                    favorites={favorites}
                    toggleFavorite={toggleFavorite}
                    shareRecipe={shareRecipe}
                    printRecipe={printRecipe}
                    lang={lang}
                    t={t}
                />
            )}

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
            `}</style>
        </div>
    );
}
