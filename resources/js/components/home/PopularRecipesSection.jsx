import { useState, useEffect } from "react";
import { Heart, Clock, Users, Star, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { useLang } from "@/context/LangContext";
import axios from "axios";
import RecipeModal from "./RecipeModal";

export default function PopularRecipesSection() {
    const { lang } = useLang();
    const t = (ar, en) => (lang === "ar" ? ar : en);

    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchPopularRecipes();
    }, [lang]);

    const fetchPopularRecipes = async () => {
        try {
            const res = await axios.get(`/api/popular-recipes?lang=${lang}`);
            setRecipes(res.data.recipes || []);
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const openModal = (recipe) => {
        setSelectedRecipe(recipe);
        setShowModal(true);
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
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <div className="flex items-center justify-center gap-3 mb-3">
                        <Star className="w-8 h-8 text-amber-400" />
                        <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                            {t("الوصفات الأكثر شعبية", "Most Popular Recipes")}
                        </h2>
                        <TrendingUp className="w-8 h-8 text-green-400" />
                    </div>
                    <p className="text-gray-400 text-lg">
                        {t(
                            "الوصفات المفضلة لدى مستخدمينا",
                            "Our community's favorite recipes"
                        )}
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {recipes.slice(0, 8).map((recipe, idx) => (
                        <motion.div
                            key={recipe.idMeal}
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
                                    alt={recipe.strMeal}
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

                            <div className="p-4">
                                <h3 className="font-bold text-white mb-2 line-clamp-2 text-base">
                                    {recipe.strMeal}
                                </h3>

                                <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
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

                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-green-400 bg-green-900/30 px-2 py-1 rounded-lg">
                                        {recipe.strCategory}
                                    </span>
                                    <span className="text-xs text-amber-400 bg-amber-900/30 px-2 py-1 rounded-lg">
                                        {recipe.strArea}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
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
