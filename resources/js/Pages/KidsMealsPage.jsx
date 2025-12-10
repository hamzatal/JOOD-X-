import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    RefreshCw,
    X,
    ChefHat,
    Clock,
    Users,
    Star,
    Sparkles,
    Heart,
    Apple,
    Cookie,
    IceCream,
    Pizza,
    Utensils,
    BookOpen,
    Share2,
    Printer,
    Smile,
    Baby,
    Cake,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
function KidsHero({ lang, onRefresh, refreshing }) {
    const t = (ar, en) => (lang === "ar" ? ar : en);

    return (
        <section className="relative overflow-hidden bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 text-white py-20 px-6">
            <div className="absolute inset-0 overflow-hidden opacity-15">
                <motion.div
                    className="absolute top-10 left-10"
                    animate={{ y: [0, -30, 0], rotate: [0, 15, 0] }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                >
                    <Cookie size={70} />
                </motion.div>
                <motion.div
                    className="absolute top-20 right-20"
                    animate={{ y: [0, 25, 0], rotate: [0, -15, 0] }}
                    transition={{
                        duration: 3.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.5,
                    }}
                >
                    <IceCream size={90} />
                </motion.div>
                <motion.div
                    className="absolute bottom-20 left-1/4"
                    animate={{ scale: [1, 1.3, 1], rotate: [0, 20, 0] }}
                    transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                >
                    <Pizza size={85} />
                </motion.div>
                <motion.div
                    className="absolute bottom-10 right-1/3"
                    animate={{ y: [0, -20, 0] }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                >
                    <Cake size={80} />
                </motion.div>
                <motion.div
                    className="absolute top-1/2 left-1/2"
                    animate={{ rotate: [0, 360] }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                >
                    <Apple size={100} className="opacity-30" />
                </motion.div>
            </div>

            {/* المحتوى */}
            <div className="max-w-7xl mx-auto relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center"
                >
                    {/* العنوان المرح */}
                    <div className="flex items-center justify-center gap-4 mb-6 flex-wrap">
                        <motion.div
                            animate={{
                                scale: [1, 1.2, 1],
                                rotate: [0, 10, -10, 0],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                repeatDelay: 1,
                            }}
                        >
                            <Smile
                                size={56}
                                className="text-yellow-300 drop-shadow-lg"
                            />
                        </motion.div>
                        <h1 className="text-5xl md:text-7xl font-black drop-shadow-2xl">
                            {t(
                                "🎨 وجبات الأطفال السعيدة",
                                "🎨 Happy Kids Meals"
                            )}
                        </h1>
                        <motion.div
                            animate={{
                                scale: [1, 1.2, 1],
                                rotate: [0, -10, 10, 0],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                repeatDelay: 1,
                                delay: 0.5,
                            }}
                        >
                            <Heart
                                size={56}
                                className="text-red-300 drop-shadow-lg"
                            />
                        </motion.div>
                    </div>

                    <p className="text-xl md:text-3xl font-bold text-yellow-100 max-w-4xl mx-auto mb-4 drop-shadow-lg">
                        {t(
                            "🌈 وجبات صحية ولذيذة وملونة يحبها كل طفل! 🎉",
                            "🌈 Healthy, Tasty & Colorful Meals Every Kid Loves! 🎉"
                        )}
                    </p>

                    <p className="text-lg text-white/90 max-w-3xl mx-auto mb-8">
                        {t(
                            "وصفات سريعة وسهلة | مكونات صحية | ألوان مبهجة | مناسبة للأعمار 3-10 سنوات",
                            "Quick & Easy Recipes | Healthy Ingredients | Bright Colors | Perfect for Ages 3-10"
                        )}
                    </p>

                    {/* زر التوليد المرح */}
                    <motion.button
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onRefresh}
                        disabled={refreshing}
                        className="px-12 py-5 bg-white text-purple-600 rounded-full font-black text-xl flex items-center gap-4 shadow-2xl mx-auto hover:shadow-purple-300/60 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {refreshing ? (
                            <RefreshCw size={28} className="animate-spin" />
                        ) : (
                            <Sparkles size={28} />
                        )}
                        {refreshing
                            ? t("🎨 جاري التوليد...", "🎨 Creating Magic...")
                            : t(
                                  "✨ توليد وصفات جديدة",
                                  "✨ Generate New Recipes"
                              )}
                    </motion.button>

                    {/* شارات ميزات */}
                    <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                        {[
                            {
                                icon: <Baby />,
                                text: t("مناسب للأطفال", "Kid-Friendly"),
                            },
                            {
                                icon: <Apple />,
                                text: t("صحي 100%", "100% Healthy"),
                            },
                            {
                                icon: <Clock />,
                                text: t("سريع التحضير", "Quick & Easy"),
                            },
                            {
                                icon: <Smile />,
                                text: t("لذيذ جداً", "Super Tasty"),
                            },
                        ].map((badge, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 + i * 0.1 }}
                                className="flex items-center gap-2 px-5 py-3 bg-white/20 backdrop-blur-md rounded-full border-2 border-white/40 shadow-lg"
                            >
                                <span className="text-yellow-300">
                                    {badge.icon}
                                </span>
                                <span className="font-bold text-sm">
                                    {badge.text}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* موجة سفلية */}
            <div className="absolute bottom-0 left-0 right-0">
                <svg
                    viewBox="0 0 1440 100"
                    className="w-full h-20 fill-gray-950"
                >
                    <path d="M0,50 C240,100 480,0 720,50 C960,100 1200,0 1440,50 L1440,100 L0,100 Z" />
                </svg>
            </div>
        </section>
    );
}

// بطاقة الوجبة
function KidsMealCard({ meal, onOpen, lang }) {
    const t = (ar, en) => (lang === "ar" ? ar : en);
    const title = lang === "ar" && meal.titleAr ? meal.titleAr : meal.title;
    const category =
        lang === "ar" && meal.categoryAr ? meal.categoryAr : meal.category;

    return (
        <motion.div
            whileHover={{ scale: 1.03, y: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={onOpen}
            className="group bg-gradient-to-br from-purple-900/40 via-pink-900/40 to-blue-900/40 rounded-3xl overflow-hidden border-2 border-purple-500/30 hover:border-pink-400 transition-all shadow-xl hover:shadow-pink-500/30 cursor-pointer"
        >
            {/* الصورة */}
            <div className="relative h-48 overflow-hidden">
                <img
                    src={meal.image}
                    alt={title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          
               

                {/* الفئة العمرية */}
                {meal.age_range && (
                    <div className="absolute top-3 left-3 bg-pink-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
                        {t(`عمر ${meal.age_range}`, `Age ${meal.age_range}`)}
                    </div>
                )}
            </div>

            {/* المحتوى */}
            <div className="p-5">
                <h4 className="font-bold text-white text-lg mb-2 line-clamp-2 group-hover:text-pink-300 transition">
                    {title}
                </h4>

                <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                    {meal.description || meal.benefits}
                </p>

                <div className="flex items-center justify-between text-xs text-gray-400 gap-2">
                    <span className="flex items-center gap-1 px-3 py-1.5 bg-purple-900/60 rounded-full">
                        <ChefHat size={14} />
                        {category}
                    </span>
                    <span className="flex items-center gap-1 px-3 py-1.5 bg-blue-900/60 rounded-full">
                        <Clock size={14} />
                        {meal.time} {t("د", "min")}
                    </span>
                </div>

                {/* معلومات إضافية */}
                <div className="mt-3 pt-3 border-t border-gray-700/50 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1 text-green-400">
                        <Heart size={14} />
                        {meal.calories || "250"} {t("سعرة", "cal")}
                    </span>
                    <span className="flex items-center gap-1 text-yellow-400">
                        <Users size={14} />
                        {meal.servings || 2} {t("حصص", "servings")}
                    </span>
                </div>
            </div>
        </motion.div>
    );
}

// المودال
function KidsMealModal({ meal, onClose, lang }) {
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
                className={`bg-gradient-to-br from-gray-900 via-purple-900/20 to-pink-900/20 rounded-3xl shadow-2xl border-2 border-purple-500/30 w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col lg:flex-row ${
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
                        <span className="flex items-center gap-2 px-3 py-2 bg-pink-600/90 backdrop-blur-sm rounded-full text-white text-sm font-bold border-2 border-pink-400/50 shadow-lg">
                            <ChefHat size={16} />
                            {meal.category}
                        </span>
                        {meal.age_range && (
                            <span className="flex items-center gap-2 px-3 py-2 bg-purple-600/90 backdrop-blur-sm rounded-full text-white text-sm font-bold border-2 border-purple-400/50 shadow-lg">
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


                    {/* المعلومات السريعة */}
                    <div className="px-6 py-4 grid grid-cols-2 md:grid-cols-4 gap-3 border-b border-purple-700/30">
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
                                className="text-center p-3 bg-purple-900/30 rounded-xl border border-purple-700/30"
                            >
                                <div className="flex justify-center text-pink-400 mb-1">
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
                                className={`text-xl font-bold text-pink-400 mb-4 flex items-center gap-3 ${
                                    isRTL ? "flex-row-reverse" : ""
                                }`}
                            >
                                <Utensils size={22} />
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
                                        } items-center gap-3 p-3 bg-purple-900/40 rounded-xl border border-purple-700/30 hover:border-pink-500/50 transition group`}
                                    >
                                        <div className="w-3 h-3 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full group-hover:scale-150 transition" />
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
                                className={`text-xl font-bold text-purple-400 mb-4 flex items-center gap-3 ${
                                    isRTL ? "flex-row-reverse" : ""
                                }`}
                            >
                                <BookOpen size={22} />
                                {t("طريقة التحضير", "Instructions")}
                            </h3>
                            <div
                                className={`text-gray-300 leading-relaxed text-sm whitespace-pre-line bg-gray-800/50 p-5 rounded-2xl border border-purple-700/30 ${
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
                                            className="px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all shadow-lg"
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
                    background: rgba(88, 28, 135, 0.3);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: linear-gradient(180deg, #ec4899, #a855f7);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: linear-gradient(180deg, #db2777, #9333ea);
                }
            `}</style>
        </motion.div>
    );
}

// قسم النصائح
function NutritionTips({ tips, lang, loading }) {
    const t = (ar, en) => (lang === "ar" ? ar : en);

    return (
        <section className="mt-16 mb-12 bg-gradient-to-br from-purple-900/40 via-pink-900/40 to-blue-900/40 p-8 rounded-3xl border-2 border-purple-500/30 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
                <Apple size={32} className="text-green-400" />
                <h3 className="text-3xl font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                    {t("🍎 نصائح تغذية الأطفال", "🍎 Kids Nutrition Tips")}
                </h3>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <div
                            key={i}
                            className="h-20 bg-gray-800/50 rounded-xl animate-pulse"
                        />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tips.map((tip, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="flex items-start gap-3 p-4 bg-gray-900/60 rounded-xl border border-purple-700/30 hover:border-pink-500/50 transition group"
                        >
                            <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center font-bold text-white shadow-lg group-hover:scale-110 transition">
                                {i + 1}
                            </div>
                            <p className="text-gray-200 text-sm leading-relaxed flex-1">
                                {tip}
                            </p>
                        </motion.div>
                    ))}
                </div>
            )}
        </section>
    );
}

// الصفحة الرئيسية
export default function KidsMealsPage() {
    const [lang, setLang] = useState("ar");
    const [meals, setMeals] = useState([]);
    const [tips, setTips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [tipsLoading, setTipsLoading] = useState(true);
    const [selectedMeal, setSelectedMeal] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const t = (ar, en) => (lang === "ar" ? ar : en);

    const fetchMeals = async (force = false) => {
        try {
            if (force) setRefreshing(true);
            else setLoading(true);

            const res = await fetch(
                `/api/kids-meals?lang=${lang}&refresh=${force}`
            );
            const data = await res.json();

            setMeals(data.recipes || []);
        } catch (e) {
            console.error("Failed to fetch meals:", e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const fetchTips = async () => {
        try {
            setTipsLoading(true);
            const res = await fetch(`/api/kids-meals/tips?lang=${lang}`);
            const data = await res.json();

            if (data.success) {
                setTips(data.tips || []);
            }
        } catch (e) {
            console.error("Failed to fetch tips:", e);
        } finally {
            setTipsLoading(false);
        }
    };

    useEffect(() => {
        fetchMeals();
        fetchTips();
    }, [lang]);

    const openModal = (meal) => {
        setSelectedMeal(meal);
        setShowModal(true);
        document.body.style.overflow = "hidden";
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedMeal(null);
        document.body.style.overflow = "unset";
    };

    return (
        <div className="min-h-screen bg-gray-950 text-gray-200">
            <Navbar lang={lang} />
            {/* Hero */}
            <KidsHero
                lang={lang}
                onRefresh={() => fetchMeals(true)}
                refreshing={refreshing}
            />

            {/* المحتوى الرئيسي */}
            <main className="max-w-7xl mx-auto p-6">
                {/* العنوان */}
                <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                    <h2 className="text-3xl font-black bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                        {t(
                            "🌟 وصفات الأطفال المميزة",
                            "🌟 Featured Kids Recipes"
                        )}
                    </h2>
                    <div className="text-sm text-gray-400 bg-gray-900/60 px-4 py-2 rounded-full border border-purple-700/30">
                        {meals.length} {t("وصفة", "recipes")}
                    </div>
                </div>

                {/* قائمة الوجبات */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[...Array(12)].map((_, i) => (
                            <div
                                key={i}
                                className="h-80 bg-gray-800/50 rounded-3xl animate-pulse"
                            />
                        ))}
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    >
                        {meals.length === 0 ? (
                            <div className="col-span-full text-center py-20">
                                <Cookie
                                    size={64}
                                    className="mx-auto text-gray-600 mb-4"
                                />
                                <p className="text-gray-400 text-lg">
                                    {t(
                                        "لا توجد وصفات حالياً",
                                        "No recipes available"
                                    )}
                                </p>
                            </div>
                        ) : (
                            meals.map((meal) => (
                                <KidsMealCard
                                    key={meal.id}
                                    meal={meal}
                                    lang={lang}
                                    onOpen={() => openModal(meal)}
                                />
                            ))
                        )}
                    </motion.div>
                )}

                {/* النصائح */}
                <NutritionTips tips={tips} lang={lang} loading={tipsLoading} />

                {/* قسم معلومات إضافية */}
                <section className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        {
                            icon: <Heart size={40} />,
                            color: "from-red-500 to-pink-500",
                            title: t("صحي ومغذي", "Healthy & Nutritious"),
                            desc: t(
                                "وجبات متوازنة تحتوي على جميع العناصر الغذائية",
                                "Balanced meals with all nutrients"
                            ),
                        },
                        {
                            icon: <Smile size={40} />,
                            color: "from-yellow-500 to-orange-500",
                            title: t("يحبها الأطفال", "Kids Love It"),
                            desc: t(
                                "وصفات لذيذة ومحببة لجميع الأطفال",
                                "Tasty recipes all kids love"
                            ),
                        },
                        {
                            icon: <Clock size={40} />,
                            color: "from-blue-500 to-purple-500",
                            title: t("سريعة التحضير", "Quick & Easy"),
                            desc: t(
                                "وصفات جاهزة في أقل من 30 دقيقة",
                                "Ready in less than 30 minutes"
                            ),
                        },
                    ].map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="p-6 bg-gradient-to-br from-gray-900/60 to-gray-800/60 rounded-2xl border border-purple-700/30 hover:border-pink-500/50 transition group"
                        >
                            <div
                                className={`w-16 h-16 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition shadow-lg`}
                            >
                                {item.icon}
                            </div>
                            <h4 className="text-xl font-bold text-white mb-2">
                                {item.title}
                            </h4>
                            <p className="text-gray-400 text-sm">{item.desc}</p>
                        </motion.div>
                    ))}
                </section>
            </main>

            <Footer lang={lang} />

            <AnimatePresence>
                {showModal && selectedMeal && (
                    <KidsMealModal
                        meal={selectedMeal}
                        onClose={closeModal}
                        lang={lang}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
