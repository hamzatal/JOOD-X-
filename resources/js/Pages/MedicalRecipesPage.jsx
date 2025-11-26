import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import RecipeCard from "../Components/medical-recipes/RecipeCard";
import RecipeModal from "../Components/medical-recipes/RecipeModal";
import ConditionFilter from "../Components/medical-recipes/ConditionFilter";
import LoadingSkeleton from "../Components/medical-recipes/LoadingSkeleton";
import ChatBot from "../Components/medical-recipes/ChatBot";
import CustomDiseaseInput from "../Components/medical-recipes/CustomDiseaseInput";
import NutritionTips from "../Components/medical-recipes/NutritionTips";
import { useLang } from "../context/LangContext";
import {
    HeartPulseIcon,
    SparklesIcon,
    RefreshCwIcon,
    MessageCircleIcon,
    ChefHatIcon,
    LeafIcon,
    ActivityIcon,
    Loader2Icon,
} from "lucide-react";
import axios from "axios";

export default function MedicalRecipesPage() {
    const { lang } = useLang();
    const [recipes, setRecipes] = useState([]);
    const [conditions, setConditions] = useState([]);
    const [selectedCondition, setSelectedCondition] = useState("general");
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [showChatBot, setShowChatBot] = useState(false);
    const [nutritionTips, setNutritionTips] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState(null);
    const [generationProgress, setGenerationProgress] = useState(0);
    const recipesRef = useRef(null);

    useEffect(() => {
        loadConditions();
        loadNutritionTips();
    }, [selectedCondition, lang]);

    useEffect(() => {
        if (selectedCondition) {
            loadRecipes(1);
        }
    }, [selectedCondition, lang]);

    const loadConditions = async () => {
        try {
            const res = await axios.get(
                `/api/medical-recipes/conditions?lang=${lang}`
            );
            setConditions(res.data.conditions);
        } catch (err) {
            console.error("Failed to load conditions", err);
        }
    };

    const loadRecipes = async (page = 1) => {
        setLoading(true);
        try {
            const res = await axios.get(
                `/api/medical-recipes?condition=${selectedCondition}&lang=${lang}&page=${page}`
            );

            if (res.data.data.recipes && res.data.data.recipes.length > 0) {
                setRecipes(res.data.data.recipes);
                setPagination(res.data.data.pagination);
                setCurrentPage(page);
            } else {
                if (page === 1) {
                    await generateRecipes();
                }
            }
        } catch (err) {
            console.error("Failed to load recipes", err);
        } finally {
            setLoading(false);
        }
    };

    const loadNutritionTips = async () => {
        try {
            const res = await axios.get(
                `/api/medical-recipes/nutrition-tips?condition=${selectedCondition}&lang=${lang}`
            );
            setNutritionTips(res.data.tips);
        } catch (err) {
            console.error("Failed to load nutrition tips", err);
        }
    };

    const generateRecipes = async (customRequest = null) => {
        setGenerating(true);
        setGenerationProgress(0);

        const progressInterval = setInterval(() => {
            setGenerationProgress((prev) => {
                if (prev >= 85) return prev;
                return prev + 15;
            });
        }, 600);

        try {
            const payload = {
                condition: selectedCondition,
                lang: lang,
            };

            if (customRequest && customRequest.trim()) {
                payload.custom_request = customRequest.trim();
            }

            const res = await axios.post(
                "/api/medical-recipes/generate",
                payload
            );

            clearInterval(progressInterval);
            setGenerationProgress(100);

            if (res.data.success && res.data.data.recipes) {
                setRecipes(res.data.data.recipes);
                setPagination(null);
                setCurrentPage(1);
            }
        } catch (err) {
            console.error("Failed to generate", err);
            clearInterval(progressInterval);
        } finally {
            setTimeout(() => {
                setGenerating(false);
                setGenerationProgress(0);
            }, 300);
        }
    };

    const handleCustomDiseaseSubmit = async (diseaseInfo) => {
        if (diseaseInfo && diseaseInfo.trim()) {
            await generateRecipes(diseaseInfo.trim());
        }
    };

    const handlePageChange = (page) => {
        loadRecipes(page);
        recipesRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-50 via-green-50 to-blue-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-900">
            <Navbar />

            <section className="relative overflow-hidden bg-gradient-to-r from-green-600 via-teal-600 to-blue-600 text-white py-16 px-6">
                <div className="absolute inset-0 overflow-hidden opacity-10">
                    <div className="absolute top-10 left-10 animate-float">
                        <LeafIcon size={60} />
                    </div>
                    <div className="absolute top-20 right-20 animate-float-delayed">
                        <ChefHatIcon size={80} />
                    </div>
                    <div className="absolute bottom-20 left-1/4 animate-float">
                        <ActivityIcon size={70} />
                    </div>
                    <div className="absolute bottom-10 right-1/3 animate-float-delayed">
                        <HeartPulseIcon size={90} />
                    </div>
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
                                {lang === "ar"
                                    ? "الوصفات العلاجية"
                                    : "Medical Recipes"}
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
                            {lang === "ar"
                                ? "وصفات صحية مخصصة | آمنة طبيًا | استشارات فورية"
                                : "Personalized recipes | Medically safe | Instant consultation"}
                        </p>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowChatBot(true)}
                            className="px-6 py-3 bg-white text-green-700 rounded-2xl font-bold flex items-center gap-2 shadow-xl mx-auto"
                        >
                            <MessageCircleIcon size={20} />
                            {lang === "ar" ? "المساعد الذكي" : "AI Assistant"}
                        </motion.button>
                    </motion.div>
                </div>

                <div className="absolute bottom-0 left-0 right-0">
                    <svg
                        viewBox="0 0 1440 80"
                        className="w-full h-12 fill-teal-50 dark:fill-gray-900"
                    >
                        <path d="M0,40L48,45C96,50,192,60,288,60C384,60,480,50,576,45C672,40,768,40,864,45C960,50,1056,60,1152,60C1248,60,1344,50,1392,45L1440,40L1440,80L0,80Z"></path>
                    </svg>
                </div>
            </section>

            <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 -mt-6 relative z-20">
                <CustomDiseaseInput
                    onSubmit={handleCustomDiseaseSubmit}
                    lang={lang}
                    loading={generating}
                />

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 md:p-6 mb-6">
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-4">
                        <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                            {lang === "ar"
                                ? "اختر حالتك الصحية"
                                : "Select Your Condition"}
                        </h2>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => generateRecipes(null)}
                            disabled={generating}
                            className="px-4 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl font-semibold flex items-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <RefreshCwIcon
                                size={18}
                                className={generating ? "animate-spin" : ""}
                            />
                            {generating
                                ? lang === "ar"
                                    ? "جاري التوليد..."
                                    : "Generating..."
                                : lang === "ar"
                                ? "توليد جديد"
                                : "Generate New"}
                        </motion.button>
                    </div>

                    <ConditionFilter
                        conditions={conditions}
                        selected={selectedCondition}
                        onSelect={setSelectedCondition}
                        lang={lang}
                    />
                </div>

                {nutritionTips.length > 0 && (
                    <NutritionTips
                        tips={nutritionTips}
                        lang={lang}
                        condition={selectedCondition}
                    />
                )}

                {generating && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-6"
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <Loader2Icon
                                size={32}
                                className="text-green-600 animate-spin"
                            />
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                    {lang === "ar"
                                        ? "جاري توليد الوصفات..."
                                        : "Generating recipes..."}
                                </h3>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{
                                            width: `${generationProgress}%`,
                                        }}
                                        className="h-full bg-gradient-to-r from-green-600 to-teal-600 rounded-full"
                                        transition={{ duration: 0.5 }}
                                    />
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                    {generationProgress}%{" "}
                                    {lang === "ar" ? "مكتمل" : "complete"}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}

                <div ref={recipesRef}>
                    {loading ? (
                        <LoadingSkeleton count={5} columns={5} />
                    ) : (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8"
                            >
                                <AnimatePresence mode="popLayout">
                                    {recipes.slice(0, 5).map((recipe, idx) => (
                                        <RecipeCard
                                            key={recipe.id}
                                            recipe={recipe}
                                            index={idx}
                                            lang={lang}
                                            onView={() =>
                                                setSelectedRecipe(recipe)
                                            }
                                        />
                                    ))}
                                </AnimatePresence>
                            </motion.div>
                        </>
                    )}

                    {!loading && !generating && recipes.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl shadow-xl"
                        >
                            <SparklesIcon
                                size={80}
                                className="mx-auto text-gray-300 dark:text-gray-600 mb-6"
                            />
                            <h3 className="text-2xl font-bold text-gray-600 dark:text-gray-400 mb-3">
                                {lang === "ar"
                                    ? "لا توجد وصفات"
                                    : "No recipes yet"}
                            </h3>
                            <p className="text-gray-500 dark:text-gray-500 mb-6">
                                {lang === "ar"
                                    ? "اضغط 'توليد جديد' لإنشاء وصفات صحية"
                                    : "Click 'Generate New' to create healthy recipes"}
                            </p>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                onClick={() => generateRecipes(null)}
                                className="px-8 py-4 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-2xl font-bold shadow-xl"
                            >
                                {lang === "ar" ? "توليد الآن" : "Generate Now"}
                            </motion.button>
                        </motion.div>
                    )}
                </div>
            </main>

            <RecipeModal
                recipe={selectedRecipe}
                isOpen={!!selectedRecipe}
                onClose={() => setSelectedRecipe(null)}
                lang={lang}
            />

            <ChatBot
                isOpen={showChatBot}
                onClose={() => setShowChatBot(false)}
                lang={lang}
                condition={selectedCondition}
            />

            {!showChatBot && (
                <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                    onClick={() => setShowChatBot(true)}
                    className="fixed bottom-6 right-6 w-14 h-14 md:w-16 md:h-16 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-full shadow-2xl flex items-center justify-center z-40"
                >
                    <MessageCircleIcon size={24} />
                </motion.button>
            )}

            <Footer />

            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                }
                @keyframes float-delayed {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-15px); }
                }
                .animate-float { animation: float 6s ease-in-out infinite; }
                .animate-float-delayed { animation: float-delayed 7s ease-in-out infinite; }
            `}</style>
        </div>
    );
}
