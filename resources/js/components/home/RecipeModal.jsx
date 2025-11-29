import { useState } from "react";
import {
    X,
    ChefHat,
    Globe,
    BookOpen,
    Sparkles,
    Share2,
    Printer,
} from "lucide-react";
import { motion } from "framer-motion";

export default function RecipeModal({ meal, onClose, lang = "en" }) {
    if (!meal) return null;

    const isRTL = lang === "ar";
    const t = (ar, en) => (lang === "ar" ? ar : en);

    const [showFullInstructions, setShowFullInstructions] = useState(false);

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

    const ingredients = Array.from({ length: 20 }, (_, i) => {
        const ingredientEn = meal[`strIngredient${i + 1}`]?.trim();
        const ingredientAr = meal[`strIngredient${i + 1}Ar`]?.trim();
        const measure = meal[`strMeasure${i + 1}`]?.trim();
        const ingredient =
            lang === "ar" && ingredientAr ? ingredientAr : ingredientEn;
        return { ingredient, measure };
    }).filter((item) => item.ingredient);

    const shouldShowButton =
        displayInstructions && displayInstructions.length > 400;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
            onClick={onClose}
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
                {/* Image section */}
                <div className="relative flex-shrink-0">
                    <img
                        src={meal.strMealThumb}
                        alt={displayTitle}
                        className="w-full h-64 lg:w-96 lg:h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    <div
                        className={`absolute bottom-4 ${
                            isRTL ? "right-4" : "left-4"
                        } flex gap-2`}
                    >
                        <span className="flex items-center gap-2 px-3 py-1.5 bg-green-600/90 backdrop-blur-sm rounded-full text-white text-sm font-semibold border border-green-500/50 shadow-lg">
                            <ChefHat size={14} />
                            {displayCategory}
                        </span>
                        <span className="flex items-center gap-2 px-3 py-1.5 bg-amber-600/90 backdrop-blur-sm rounded-full text-white text-sm font-semibold border border-amber-500/50 shadow-lg">
                            <Globe size={14} />
                            {displayArea}
                        </span>
                    </div>
                </div>

                {/* Content section */}
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
                        <div className={`flex-1 ${isRTL ? "pl-6" : "pr-6"}`}>
                            <h2
                                className={`text-2xl md:text-3xl font-bold bg-gradient-to-r from-green-400 via-green-300 to-amber-400 bg-clip-text text-transparent leading-tight ${
                                    isRTL ? "text-right" : "text-left"
                                }`}
                            >
                                {displayTitle}
                            </h2>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() =>
                                    navigator
                                        .share?.({
                                            title: displayTitle,
                                            text: displayInstructions?.substring(
                                                0,
                                                100
                                            ),
                                            url: window.location.href,
                                        })
                                        .catch(() => {})
                                }
                                className="p-2.5 rounded-xl bg-gray-800/80 hover:bg-gray-700 text-gray-400 hover:text-white transition hover:scale-110"
                                title={t("مشاركة", "Share")}
                            >
                                <Share2 size={20} />
                            </button>
                            <button
                                onClick={() => window.print()}
                                className="p-2.5 rounded-xl bg-gray-800/80 hover:bg-gray-700 text-gray-400 hover:text-white transition hover:scale-110"
                                title={t("طباعة", "Print")}
                            >
                                <Printer size={20} />
                            </button>
                            <button
                                onClick={onClose}
                                className="p-2.5 rounded-xl bg-gray-800/80 hover:bg-red-600/80 text-gray-400 hover:text-white transition hover:scale-110"
                                title={t("إغلاق", "Close")}
                            >
                                <X size={24} />
                            </button>
                        </div>
                    </div>

                    {/* Scrollable content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                        {/* Ingredients */}
                        <div>
                            <h3
                                className={`text-xl font-bold text-amber-400 mb-4 flex items-center gap-3 ${
                                    isRTL ? "flex-row-reverse" : ""
                                }`}
                            >
                                <Sparkles size={22} />
                                {t(
                                    `المكونات (${ingredients.length})`,
                                    `Ingredients (${ingredients.length})`
                                )}
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {ingredients.map(
                                    ({ ingredient, measure }, i) => (
                                        <div
                                            key={i}
                                            className={`flex ${
                                                isRTL
                                                    ? "flex-row-reverse"
                                                    : "flex-row"
                                            } items-center justify-between p-3 bg-gray-800/60 rounded-xl border border-gray-700/50 hover:border-green-500/50 transition-all group`}
                                        >
                                            <div
                                                className={`flex items-center gap-2 ${
                                                    isRTL
                                                        ? "flex-row-reverse"
                                                        : ""
                                                }`}
                                            >
                                                <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-amber-400 rounded-full group-hover:scale-150 transition" />
                                                <span className="text-gray-200 font-medium text-sm">
                                                    {ingredient}
                                                </span>
                                            </div>
                                            {measure && (
                                                <span className="text-green-400 font-semibold text-xs bg-green-900/40 px-2.5 py-1 rounded-lg">
                                                    {measure}
                                                </span>
                                            )}
                                        </div>
                                    )
                                )}
                            </div>
                        </div>

                        {/* Instructions */}
                        <div>
                            <h3
                                className={`text-xl font-bold text-green-400 mb-4 flex items-center gap-3 ${
                                    isRTL ? "flex-row-reverse" : ""
                                }`}
                            >
                                <BookOpen size={22} />
                                {t("طريقة التحضير", "Instructions")}
                            </h3>

                            <div
                                className={`text-gray-300 leading-relaxed text-sm md:text-base whitespace-pre-line bg-gray-800/50 p-5 rounded-2xl border border-gray-700/50 ${
                                    isRTL ? "text-right" : "text-left"
                                }`}
                            >
                                {/* عرض النص */}
                                <div
                                    className={
                                        showFullInstructions
                                            ? ""
                                            : "max-h-[300px] overflow-hidden relative"
                                    }
                                >
                                    {displayInstructions ||
                                        t(
                                            "لا توجد تعليمات متاحة",
                                            "No instructions available"
                                        )}

                                    {/* Gradient overlay */}
                                    {!showFullInstructions &&
                                        shouldShowButton && (
                                            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-gray-800 to-transparent"></div>
                                        )}
                                </div>

                                {/* زر عرض المزيد/أقل */}
                                {shouldShowButton && (
                                    <div className="mt-4 flex justify-center">
                                        <button
                                            onClick={() =>
                                                setShowFullInstructions(
                                                    !showFullInstructions
                                                )
                                            }
                                            className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                                        >
                                            {showFullInstructions ? (
                                                <>
                                                    {t("عرض أقل", "Show Less")}
                                                    <span className="text-lg">
                                                        {isRTL ? "▲" : "▲"}
                                                    </span>
                                                </>
                                            ) : (
                                                <>
                                                    {t(
                                                        "عرض المزيد",
                                                        "Show More"
                                                    )}
                                                    <span className="text-lg">
                                                        {isRTL ? "▼" : "▼"}
                                                    </span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Video */}
                        {meal.strYoutube && (
                            <div>
                                <h3
                                    className={`text-xl font-bold text-red-400 mb-4 flex items-center gap-3 ${
                                        isRTL ? "flex-row-reverse" : ""
                                    }`}
                                >
                                    <svg
                                        className="w-6 h-6"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                    </svg>
                                    {t("فيديو الوصفة", "Recipe Video")}
                                </h3>
                                <div className="aspect-video rounded-2xl overflow-hidden border-2 border-gray-700 shadow-xl">
                                    <iframe
                                        src={`https://www.youtube.com/embed/${
                                            meal.strYoutube.split("v=")[1]
                                        }`}
                                        className="w-full h-full"
                                        allowFullScreen
                                        title="Recipe Video"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>

            <style>{`
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
        </motion.div>
    );
}
