import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X,
    BookOpen,
    Sparkles,
    Share2,
    Printer,
    Clock,
    Calendar,
} from "lucide-react";

const t = (ar, en, lang) => (lang === "ar" ? ar : en);

export default function ArticleModal({ article, onClose, lang }) {
    const [showFullContent, setShowFullContent] = useState(false);
    const isRTL = lang === "ar";

    useEffect(() => {
        if (article) {
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [article]);

    if (!article) return null;

    const shouldShowButton = article.content && article.content.length > 800;

    const getCategoryColor = (category) => {
        const colors = {
            news: "from-blue-600 to-blue-700",
            tips: "from-purple-600 to-purple-700",
            secrets: "from-amber-600 to-amber-700",
            health: "from-rose-600 to-rose-700",
            trends: "from-teal-600 to-teal-700",
        };
        return colors[category] || "from-gray-600 to-gray-700";
    };

    return (
        <AnimatePresence>
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
                        {article.image ? (
                            <img
                                src={article.image}
                                alt={article.title}
                                className="w-full h-64 lg:w-96 lg:h-full object-cover"
                            />
                        ) : (
                            <div
                                className={`w-full h-64 lg:w-96 lg:h-full bg-gradient-to-br ${getCategoryColor(
                                    article.category
                                )}`}
                            />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                        <div
                            className={`absolute bottom-4 ${
                                isRTL ? "right-4" : "left-4"
                            } flex gap-2`}
                        >
                            <span className="flex items-center gap-2 px-3 py-1.5 bg-green-600/90 backdrop-blur-sm rounded-full text-white text-sm font-semibold border border-green-500/50 shadow-lg">
                                <Calendar size={14} />
                                {article.date}
                            </span>
                            <span className="flex items-center gap-2 px-3 py-1.5 bg-amber-600/90 backdrop-blur-sm rounded-full text-white text-sm font-semibold border border-amber-500/50 shadow-lg">
                                <Clock size={14} />
                                {article.readTime}
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
                            <div
                                className={`flex-1 ${isRTL ? "pl-6" : "pr-6"}`}
                            >
                                <span className="inline-block px-3 py-1 bg-green-600/20 text-green-400 rounded-full text-xs font-semibold mb-3">
                                    {article.categoryLabel}
                                </span>
                                <h2
                                    className={`text-2xl md:text-3xl font-bold bg-gradient-to-r from-green-400 via-green-300 to-amber-400 bg-clip-text text-transparent leading-tight ${
                                        isRTL ? "text-right" : "text-left"
                                    }`}
                                >
                                    {article.title}
                                </h2>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() =>
                                        navigator
                                            .share?.({
                                                title: article.title,
                                                text: article.excerpt,
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
                            {/* Excerpt */}
                            <div className="bg-green-900/20 border-l-4 border-green-500 p-4 rounded-r-xl">
                                <p
                                    className={`text-gray-300 font-medium italic ${
                                        isRTL ? "text-right" : "text-left"
                                    }`}
                                >
                                    {article.excerpt}
                                </p>
                            </div>

                            {/* Main Content */}
                            <div>
                                <h3
                                    className={`text-xl font-bold text-green-400 mb-4 flex items-center gap-3 ${
                                        isRTL ? "flex-row-reverse" : ""
                                    }`}
                                >
                                    <BookOpen size={22} />
                                    {t("المحتوى", "Content")}
                                </h3>

                                <div
                                    className={`text-gray-300 leading-relaxed text-sm md:text-base whitespace-pre-line bg-gray-800/50 p-5 rounded-2xl border border-gray-700/50 ${
                                        isRTL ? "text-right" : "text-left"
                                    }`}
                                >
                                    <div
                                        className={
                                            showFullContent
                                                ? ""
                                                : "max-h-[400px] overflow-hidden relative"
                                        }
                                    >
                                        {article.content ||
                                            t(
                                                "لا يوجد محتوى متاح",
                                                "No content available"
                                            )}

                                        {!showFullContent &&
                                            shouldShowButton && (
                                                <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-gray-800/90 to-transparent"></div>
                                            )}
                                    </div>

                                    {shouldShowButton && (
                                        <div className="mt-4 flex justify-center">
                                            <button
                                                onClick={() =>
                                                    setShowFullContent(
                                                        !showFullContent
                                                    )
                                                }
                                                className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                                            >
                                                {showFullContent ? (
                                                    <>
                                                        {t(
                                                            "عرض أقل",
                                                            "Show Less"
                                                        )}
                                                        <span className="text-lg">
                                                            ▲
                                                        </span>
                                                    </>
                                                ) : (
                                                    <>
                                                        {t(
                                                            "عرض المزيد",
                                                            "Show More"
                                                        )}
                                                        <span className="text-lg">
                                                            ▼
                                                        </span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Tips */}
                            {article.tips && article.tips.length > 0 && (
                                <div>
                                    <h3
                                        className={`text-xl font-bold text-amber-400 mb-4 flex items-center gap-3 ${
                                            isRTL ? "flex-row-reverse" : ""
                                        }`}
                                    >
                                        <Sparkles size={22} />
                                        {t(
                                            `نصائح إضافية (${article.tips.length})`,
                                            `Additional Tips (${article.tips.length})`
                                        )}
                                    </h3>
                                    <div className="grid grid-cols-1 gap-3">
                                        {article.tips.map((tip, i) => (
                                            <div
                                                key={i}
                                                className={`flex ${
                                                    isRTL
                                                        ? "flex-row-reverse"
                                                        : "flex-row"
                                                } items-start gap-3 p-3 bg-gray-800/60 rounded-xl border border-gray-700/50 hover:border-amber-500/50 transition-all group`}
                                            >
                                                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                                    {i + 1}
                                                </div>
                                                <span
                                                    className={`text-gray-200 font-medium text-sm flex-1 ${
                                                        isRTL
                                                            ? "text-right"
                                                            : "text-left"
                                                    }`}
                                                >
                                                    {tip}
                                                </span>
                                            </div>
                                        ))}
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
        </AnimatePresence>
    );
}
