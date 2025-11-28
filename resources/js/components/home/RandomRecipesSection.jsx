import { useState, useEffect } from "react";
import {
    Clock,
    Users,
    Star,
    TrendingUp,
    RefreshCw,
    ChefHat,
    Globe,
    ShuffleIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { useLang } from "@/context/LangContext";
import axios from "axios";
import RecipeModal from "./RecipeModal";

export default function PopularRecipesSection() {
    const { lang } = useLang();
    const t = (ar, en) => (lang === "ar" ? ar : en);

    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const fetchPopularRecipes = async (refresh = false) => {
        if (refresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }

        try {
            const res = await axios.get(
                `/api/popular-recipes?lang=${lang}&refresh=${
                    refresh ? "true" : "false"
                }`
            );
            console.log("Popular recipes fetched:", res.data);
            setRecipes(res.data.recipes || []);
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchPopularRecipes();
    }, [lang]);

    const openModal = (recipe) => {
        setSelectedRecipe(recipe);
        setShowModal(true);
    };

    const handleRefresh = () => {
        fetchPopularRecipes(true);
    };

    // دالة للحصول على النص المناسب
    const getLocalizedText = (recipe, field, arField) => {
        if (lang === "ar") {
            return recipe[arField] || recipe[field];
        }
        return recipe[field];
    };

    if (loading) {
        return (
            <section className="py-16 px-4 md:px-8 bg-black">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div
                                key={i}
                                className="bg-gray-800 rounded-2xl h-80 animate-pulse"
                            ></div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-16 px-4 md:px-8 bg-black">
            <div className="max-w-7xl mx-auto">
                <div
                    className={`flex items-center justify-between mb-12 ${
                        lang === "ar" ? "flex-row-reverse" : ""
                    }`}
                >
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className={`flex-1 ${
                            lang === "ar" ? "text-right" : "text-left"
                        }`}
                    >
                        <div
                            className={`flex items-center gap-3 mb-3 ${
                                lang === "ar" ? "justify-end" : "justify-start"
                            }`}
                        >
                            <Star className="w-8 h-8 text-amber-400" />
                            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                                {t("الوصفات العشوائية", "Random Recipes")}
                            </h2>
                            <ShuffleIcon className="w-8 h-8 text-green-400" />
                        </div>
                    </motion.div>

                    <motion.button
                        initial={{ opacity: 0, x: lang === "ar" ? -20 : 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className={`flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 rounded-xl border border-amber-500/50 transition-all shadow-lg hover:shadow-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed ${
                            lang === "ar" ? "mr-4" : "ml-4"
                        }`}
                    >
                        <RefreshCw
                            className={`w-4 h-4 text-white ${
                                refreshing ? "animate-spin" : ""
                            }`}
                        />
                        <span className="text-sm font-semibold text-white">
                            {refreshing
                                ? t("جاري التحديث...", "Refreshing...")
                                : t("تحديث", "Refresh")}
                        </span>
                    </motion.button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {recipes.slice(0, 8).map((recipe, idx) => {
                        const displayTitle = getLocalizedText(
                            recipe,
                            "strMeal",
                            "strMealAr"
                        );
                        const displayCategory = getLocalizedText(
                            recipe,
                            "strCategory",
                            "strCategoryAr"
                        );
                        const displayArea = getLocalizedText(
                            recipe,
                            "strArea",
                            "strAreaAr"
                        );

                        return (
                            <motion.div
                                key={`popular-${recipe.idMeal}-${idx}`}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                whileHover={{ y: -8 }}
                                onClick={() => openModal(recipe)}
                                className="group cursor-pointer bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl overflow-hidden border border-gray-700 hover:border-green-500/50 transition-all shadow-lg hover:shadow-2xl hover:shadow-green-500/20"
                            >
                                <div className="relative h-48 overflow-hidden">
                                    <img
                                        src={recipe.strMealThumb}
                                        alt={displayTitle}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                                    <div
                                        className={`absolute top-3 ${
                                            lang === "ar" ? "left-3" : "right-3"
                                        }`}
                                    >
                                        <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                            <Star className="w-3 h-3 fill-current" />
                                            4.8
                                        </div>
                                    </div>
                                </div>

                                <div
                                    className={`p-4 ${
                                        lang === "ar"
                                            ? "text-right"
                                            : "text-left"
                                    }`}
                                >
                                    <h3 className="font-bold text-white mb-2 line-clamp-2 text-base">
                                        {displayTitle}
                                    </h3>

                                    <div
                                        className={`flex items-center gap-2 text-xs text-gray-400 mb-3 ${
                                            lang === "ar"
                                                ? "flex-row-reverse"
                                                : ""
                                        }`}
                                    >
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            30 {t("دقيقة", "min")}
                                        </span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1">
                                            <Users className="w-3 h-3" />4{" "}
                                            {t("أشخاص", "servings")}
                                        </span>
                                    </div>

                                    <div
                                        className={`flex items-center gap-2 ${
                                            lang === "ar"
                                                ? "flex-row-reverse"
                                                : ""
                                        }`}
                                    >
                                        <span className="flex items-center gap-1 text-xs text-green-400 bg-green-900/30 px-2 py-1 rounded-lg">
                                            <ChefHat className="w-3 h-3" />
                                            {displayCategory}
                                        </span>
                                        <span className="flex items-center gap-1 text-xs text-amber-400 bg-amber-900/30 px-2 py-1 rounded-lg">
                                            <Globe className="w-3 h-3" />
                                            {displayArea}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {showModal && selectedRecipe && (
                <RecipeModal
                    meal={selectedRecipe}
                    onClose={() => setShowModal(false)}
                    lang={lang}
                />
            )}
        </section>
    );
}
