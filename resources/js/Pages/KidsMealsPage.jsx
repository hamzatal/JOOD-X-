// resources/js/Pages/KidsMealsPage.jsx
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import axios from "axios";
import KidsMealCard from "@/components/kidsMeal/KidsMealCard";
import KidsMealModal from "@/components/kidsMeal/KidsMealModal";
import { useLang } from "@/context/LangContext";
import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";

export default function KidsMealsPage() {
    const { lang } = useLang();
    const t = (ar, en) => (lang === "ar" ? ar : en);

    const [meals, setMeals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selected, setSelected] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const fetchMeals = async (force = false) => {
        try {
            if (force) setRefreshing(true);
            else setLoading(true);

            const res = await axios.get(
                `/api/kids-meals?lang=${lang}&refresh=${
                    force ? "true" : "false"
                }`,
                { timeout: 30000 }
            );
            setMeals(res.data.recipes || []);
        } catch (e) {
            console.error("Failed to fetch kids meals:", e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchMeals();
    }, [lang]);

    const openModal = (meal) => {
        setSelected(meal);
        setShowModal(true);
        document.body.style.overflow = "hidden";
    };

    const closeModal = () => {
        setShowModal(false);
        setSelected(null);
        document.body.style.overflow = "unset";
    };

    return (
        <div className="min-h-screen bg-black text-gray-200">
            <Navbar />
            {/* HERO */}
            <section className="relative overflow-hidden bg-gradient-to-r from-emerald-700 via-green-600 to-teal-600 text-white py-16 px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-8">
                    <div className="flex-1 text-center md:text-left">
                        <h1 className="text-3xl md:text-4xl font-bold">
                            {t("وجبات الأطفال", "Kids Meals")}
                        </h1>
                        <p className="mt-3 text-gray-100 max-w-xl">
                            {t(
                                "وصفات مغذية، لذيذة وسهلة التحضير للأطفال — صور حقيقية ومطابقة للوصفة.",
                                "Nutritious, tasty and quick recipes for kids — real images matched to each dish."
                            )}
                        </p>
                        <div className="mt-6 flex items-center gap-3 justify-center md:justify-start">
                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => fetchMeals(true)}
                                disabled={refreshing}
                                className="inline-flex items-center gap-2 bg-white text-green-700 px-4 py-2 rounded-xl font-semibold shadow"
                            >
                                <RefreshCw
                                    className={`w-4 h-4 ${
                                        refreshing ? "animate-spin" : ""
                                    }`}
                                />
                                {refreshing
                                    ? t("جاري التحديث...", "Refreshing...")
                                    : t("جدد الوصفات", "Regenerate")}
                            </motion.button>
                            <button
                                onClick={() =>
                                    window.scrollTo({
                                        top: 800,
                                        behavior: "smooth",
                                    })
                                }
                                className="px-4 py-2 border border-white/20 rounded-xl text-sm"
                            >
                                {t("استكشف الوصفات", "Explore recipes")}
                            </button>
                        </div>
                    </div>

                    <div className="w-full md:w-1/2 grid grid-cols-2 gap-3">
                        {/* show up to 4 thumbnails of top meals while loading or when meals ready */}
                        {(loading
                            ? new Array(4).fill(null)
                            : meals.slice(0, 4)
                        ).map((m, i) => (
                            <div
                                key={i}
                                className="h-28 rounded-xl overflow-hidden border border-gray-700"
                            >
                                <img
                                    className="w-full h-full object-cover"
                                    src={
                                        m
                                            ? m.image
                                            : `/images/placeholder-food.jpg`
                                    }
                                    alt={m ? m.title : "placeholder"}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* MAIN */}
            <main className="max-w-7xl mx-auto p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">
                        {t("وصفات الأطفال الشائعة", "Popular Kids Meals")}
                    </h2>
                    <div className="text-sm text-gray-400">
                        {t(
                            "وصفات مختارة بعناية للأطفال",
                            "Carefully selected family-friendly recipes"
                        )}
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {new Array(8).fill(0).map((_, i) => (
                            <div
                                key={i}
                                className="h-56 bg-gray-800 rounded-2xl animate-pulse"
                            />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {meals.length === 0 && (
                            <div className="col-span-full text-center text-gray-400 py-12">
                                {t(
                                    "لم يتم العثور على وصفات.",
                                    "No recipes found."
                                )}
                            </div>
                        )}
                        {meals.map((meal) => (
                            <KidsMealCard
                                key={meal.id}
                                meal={meal}
                                lang={lang}
                                onOpen={() => openModal(meal)}
                            />
                        ))}
                    </div>
                )}

                {/* section - tips */}
                <section className="mt-12 bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl border border-gray-700">
                    <h3 className="font-bold text-lg mb-3">
                        {t("نصائح غذائية للأطفال", "Kids Nutrition Tips")}
                    </h3>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-300">
                        <li>
                            •{" "}
                            {t(
                                "استخدم مكونات طازجة وملونة لزيادة القبول.",
                                "Use fresh colorful ingredients to increase acceptance."
                            )}
                        </li>
                        <li>
                            •{" "}
                            {t(
                                "قسم الوجبات إلى أجزاء صغيرة وسهلة الأكل.",
                                "Serve meals in small bite-size pieces."
                            )}
                        </li>
                        <li>
                            •{" "}
                            {t(
                                "قلل من الملح والسكر وقدم بدائل صحية.",
                                "Reduce salt & sugar; provide healthy swaps."
                            )}
                        </li>
                        <li>
                            •{" "}
                            {t(
                                "اشراك الطفل في التحضير يزيد من شهيته.",
                                "Involve kids in cooking to boost appetite."
                            )}
                        </li>
                    </ul>
                </section>
            </main>

            <Footer />

            {showModal && selected && (
                <KidsMealModal
                    meal={selected}
                    onClose={closeModal}
                    lang={lang}
                />
            )}
        </div>
    );
}
