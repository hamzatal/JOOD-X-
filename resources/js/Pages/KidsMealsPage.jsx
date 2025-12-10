import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, Heart, Smile, Clock, Apple } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import KidsHero from "@/components/kidsMeal/KidsHero";
import KidsFilters from "@/components/kidsMeal/KidsFilters";
import KidsMealCard from "@/components/kidsMeal/KidsMealCard";
import KidsMealModal from "@/components/kidsMeal/KidsMealModal";

export default function KidsMealsPage() {
    const [lang, setLang] = useState("ar");
    const [meals, setMeals] = useState([]);
    const [tips, setTips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [tipsLoading, setTipsLoading] = useState(true);
    const [selectedMeal, setSelectedMeal] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [activeCategory, setActiveCategory] = useState("all");

    const t = (ar, en) => (lang === "ar" ? ar : en);

    const fetchMeals = async (force = false, category = activeCategory) => {
        try {
            if (force) setRefreshing(true);
            else setLoading(true);

            // إرسال اللغة والفئة بشكل صحيح
            const res = await fetch(
                `/api/kids-meals?lang=${lang}&refresh=${force}&category=${category}`
            );
            const data = await res.json();

            if (data.recipes && Array.isArray(data.recipes)) {
                setMeals(data.recipes);
            } else {
                console.error("Invalid response format:", data);
                setMeals([]);
            }
        } catch (e) {
            console.error("Failed to fetch meals:", e);
            setMeals([]);
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

            if (data.success && data.tips) {
                setTips(data.tips);
            }
        } catch (e) {
            console.error("Failed to fetch tips:", e);
        } finally {
            setTipsLoading(false);
        }
    };

    // تحديث البيانات عند تغيير اللغة أو الفئة
    useEffect(() => {
        fetchMeals(false, activeCategory);
        fetchTips();
    }, [lang, activeCategory]);

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
        <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-gray-200">
            <Navbar lang={lang} setLang={setLang} />

            <KidsHero
                lang={lang}
                onRefresh={() => fetchMeals(true, activeCategory)}
                refreshing={refreshing}
            />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                {/* الفلاتر */}
                <KidsFilters
                    lang={lang}
                    activeCategory={activeCategory}
                    onCategoryChange={setActiveCategory}
                />

                {/* العنوان */}
                <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                    <h2 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
                        {t(
                            "🌟 وصفات الأطفال المميزة",
                            "🌟 Featured Kids Recipes"
                        )}
                    </h2>
                    <div className="text-sm text-gray-400 bg-gray-900/80 px-4 py-2 rounded-full border border-green-600/40 backdrop-blur-sm">
                        {meals.length} {t("وصفة", "recipes")}
                    </div>
                </div>

                {/* قائمة الوجبات */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[...Array(12)].map((_, i) => (
                            <div
                                key={i}
                                className="h-96 bg-gray-800/50 rounded-3xl animate-pulse border border-gray-700/50"
                            />
                        ))}
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
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
                                <button
                                    onClick={() =>
                                        fetchMeals(true, activeCategory)
                                    }
                                    className="mt-6 px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-full font-bold hover:from-green-700 hover:to-emerald-700 transition"
                                >
                                    {t("🔄 جرب مرة أخرى", "🔄 Try Again")}
                                </button>
                            </div>
                        ) : (
                            meals.map((meal, index) => (
                                <KidsMealCard
                                    key={meal.id || index}
                                    meal={meal}
                                    lang={lang}
                                    onOpen={() => openModal(meal)}
                                />
                            ))
                        )}
                    </motion.div>
                )}

                {/* النصائح */}
                <section className="mt-16 mb-12 bg-gradient-to-br from-green-900/30 via-emerald-900/30 to-teal-900/30 p-6 sm:p-8 rounded-3xl border-2 border-green-500/30 shadow-2xl backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <Apple
                            size={32}
                            className="text-green-400 flex-shrink-0"
                        />
                        <h3 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                            {t(
                                "🍎 نصائح تغذية الأطفال",
                                "🍎 Kids Nutrition Tips"
                            )}
                        </h3>
                    </div>

                    {tipsLoading ? (
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
                                    className="flex items-start gap-3 p-4 bg-gray-900/70 rounded-xl border border-green-700/40 hover:border-green-500/60 transition-all group hover:shadow-lg hover:shadow-green-500/20"
                                >
                                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center font-bold text-white shadow-lg group-hover:scale-110 transition">
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

                {/* قسم معلومات إضافية */}
                <section className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {[
                        {
                            icon: <Heart size={40} />,
                            color: "from-red-500 to-rose-500",
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
                            color: "from-green-500 to-emerald-500",
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
                            transition={{ delay: i * 0.15 }}
                            className="p-6 bg-gradient-to-br from-gray-900/70 to-gray-800/70 rounded-2xl border border-green-700/40 hover:border-green-500/60 transition-all group hover:shadow-xl hover:shadow-green-500/20"
                        >
                            <div
                                className={`w-16 h-16 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition shadow-lg`}
                            >
                                {item.icon}
                            </div>
                            <h4 className="text-xl font-bold text-white mb-2">
                                {item.title}
                            </h4>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                {item.desc}
                            </p>
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
