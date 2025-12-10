import { useState } from "react";
import { motion } from "framer-motion";
import {
    X,
    ChefHat,
    Clock,
    Users,
    Heart,
    Sparkles,
    Apple,
    BookOpen,
    Smile,
    Share2,
    Printer,
    Baby,
} from "lucide-react";

export default function KidsMealModal({ meal, onClose, lang }) {
    const [showFull, setShowFull] = useState(false);
    const isRTL = lang === "ar";
    const t = (ar, en) => (lang === "ar" ? ar : en);

    if (!meal) return null;

    const title = lang === "ar" && meal.titleAr ? meal.titleAr : meal.title;
    const instructions =
        lang === "ar" && meal.instructionsAr
            ? meal.instructionsAr
            : meal.instructions;
    const ingredients = meal.ingredients || [];
    const shouldShowButton = instructions && instructions.length > 400;

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
                className={`bg-gradient-to-br from-gray-900 via-green-900/20 to-emerald-900/20 rounded-3xl shadow-2xl border-2 border-green-500/30 w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col lg:flex-row ${
                    isRTL ? "lg:flex-row-reverse" : ""
                }`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* قسم الصورة */}
                <div className="relative flex-shrink-0">
                    <img
                        src={meal.image}
                        alt={title}
                        className="w-full h-64 lg:w-96 lg:h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                    <div
                        className={`absolute bottom-4 ${
                            isRTL ? "right-4" : "left-4"
                        } flex gap-2 flex-wrap`}
                    >
                        <span className="flex items-center gap-2 px-3 py-2 bg-green-600/90 backdrop-blur-sm rounded-full text-white text-sm font-bold border-2 border-green-400/50 shadow-lg">
                            <ChefHat size={16} />
                            {meal.category}
                        </span>
                        {meal.age_range && (
                            <span className="flex items-center gap-2 px-3 py-2 bg-emerald-600/90 backdrop-blur-sm rounded-full text-white text-sm font-bold border-2 border-emerald-400/50 shadow-lg">
                                <Baby size={16} />
                                {t(
                                    `عمر ${meal.age_range}`,
                                    `Age ${meal.age_range}`
                                )}
                            </span>
                        )}
                    </div>
                </div>

                {/* قسم المحتوى */}
                <div
                    className="flex-1 flex flex-col"
                    dir={isRTL ? "rtl" : "ltr"}
                >
                    {/* Header */}
                    <div
                        className={`flex justify-between items-start p-6 pb-4 border-b border-green-700/30 ${
                            isRTL ? "flex-row-reverse" : ""
                        }`}
                    >
                        <div className={`flex-1 ${isRTL ? "pl-6" : "pr-6"}`}>
                            <h2
                                className={`text-2xl md:text-3xl font-bold bg-gradient-to-r from-green-400 via-emerald-300 to-teal-400 bg-clip-text text-transparent leading-tight ${
                                    isRTL ? "text-right" : "text-left"
                                }`}
                            >
                                {title}
                            </h2>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() =>
                                    navigator
                                        .share?.({
                                            title,
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

                    {/* المعلومات السريعة */}
                    <div className="px-6 py-4 grid grid-cols-2 md:grid-cols-4 gap-3 border-b border-green-700/30">
                        {[
                            {
                                icon: <Clock />,
                                label: t("الوقت", "Time"),
                                value: `${meal.time} ${t("د", "min")}`,
                            },
                            {
                                icon: <Users />,
                                label: t("الحصص", "Servings"),
                                value: meal.servings,
                            },
                            {
                                icon: <Heart />,
                                label: t("السعرات", "Calories"),
                                value: meal.calories,
                            },
                            {
                                icon: <Sparkles />,
                                label: t("الصعوبة", "Difficulty"),
                                value: meal.difficulty,
                            },
                        ].map((item, i) => (
                            <div
                                key={i}
                                className="text-center p-3 bg-green-900/30 rounded-xl border border-green-700/30"
                            >
                                <div className="flex justify-center text-green-400 mb-1">
                                    {item.icon}
                                </div>
                                <div className="text-xs text-gray-400">
                                    {item.label}
                                </div>
                                <div className="font-bold text-white">
                                    {item.value}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* المحتوى القابل للتمرير */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                        {/* نصيحة للأطفال */}
                        {meal.kid_friendly_tip && (
                            <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-l-4 border-yellow-400 p-4 rounded-xl">
                                <div className="flex items-center gap-2 mb-2">
                                    <Smile
                                        className="text-yellow-400"
                                        size={20}
                                    />
                                    <h4 className="font-bold text-yellow-300">
                                        {t(
                                            "💡 نصيحة للأطفال",
                                            "💡 Kid-Friendly Tip"
                                        )}
                                    </h4>
                                </div>
                                <p className="text-gray-200 text-sm">
                                    {meal.kid_friendly_tip}
                                </p>
                            </div>
                        )}

                        {/* الفوائد */}
                        {meal.benefits && (
                            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-l-4 border-green-400 p-4 rounded-xl">
                                <div className="flex items-center gap-2 mb-2">
                                    <Apple
                                        className="text-green-400"
                                        size={20}
                                    />
                                    <h4 className="font-bold text-green-300">
                                        {t(
                                            "🌟 الفوائد الصحية",
                                            "🌟 Health Benefits"
                                        )}
                                    </h4>
                                </div>
                                <p className="text-gray-200 text-sm">
                                    {meal.benefits}
                                </p>
                            </div>
                        )}

                        {/* المكونات */}
                        <div>
                            <h3
                                className={`text-xl font-bold text-green-400 mb-4 flex items-center gap-3 ${
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
                                {ingredients.map((ing, i) => (
                                    <div
                                        key={i}
                                        className={`flex ${
                                            isRTL ? "flex-row-reverse" : ""
                                        } items-center gap-3 p-3 bg-green-900/40 rounded-xl border border-green-700/30 hover:border-green-500/50 transition group`}
                                    >
                                        <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full group-hover:scale-150 transition" />
                                        <span className="text-gray-200 text-sm flex-1">
                                            {ing}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* التعليمات */}
                        <div>
                            <h3
                                className={`text-xl font-bold text-emerald-400 mb-4 flex items-center gap-3 ${
                                    isRTL ? "flex-row-reverse" : ""
                                }`}
                            >
                                <BookOpen size={22} />
                                {t("طريقة التحضير", "Instructions")}
                            </h3>
                            <div
                                className={`text-gray-300 leading-relaxed text-sm whitespace-pre-line bg-gray-800/50 p-5 rounded-2xl border border-green-700/30 ${
                                    isRTL ? "text-right" : "text-left"
                                }`}
                            >
                                <div
                                    className={
                                        showFull
                                            ? ""
                                            : "max-h-[300px] overflow-hidden relative"
                                    }
                                >
                                    {instructions ||
                                        t(
                                            "لا توجد تعليمات",
                                            "No instructions available"
                                        )}
                                    {!showFull && shouldShowButton && (
                                        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-gray-800 to-transparent" />
                                    )}
                                </div>
                                {shouldShowButton && (
                                    <div className="mt-4 flex justify-center">
                                        <button
                                            onClick={() =>
                                                setShowFull(!showFull)
                                            }
                                            className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-xl transition-all shadow-lg"
                                        >
                                            {showFull
                                                ? t("عرض أقل ▲", "Show Less ▲")
                                                : t(
                                                      "عرض المزيد ▼",
                                                      "Show More ▼"
                                                  )}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(6, 78, 59, 0.3);
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
