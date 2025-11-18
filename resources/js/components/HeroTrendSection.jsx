import { useEffect, useState } from "react";
import {
    ArrowRight,
    Star,
    ChefHat,
    Globe,
    TrendingUp,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import RecipeModal from "./RecipeModal";
import { useLang } from "@/context/LangContext";
import axios from "axios";

export default function HeroTrendSection() {
    const { lang } = useLang();

    const [trending, setTrending] = useState([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [showModal, setShowModal] = useState(false);

    const [visibleCount, setVisibleCount] = useState(4);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        axios.get(`/api/hero-trending?lang=${lang}`).then((res) => {
            setTrending(res.data.recipes || []);
            setActiveIndex(0);
        });
    }, [lang]);

    useEffect(() => {
        const updateCount = () => {
            const w = window.innerWidth;

            if (w >= 1280) setVisibleCount(5);
            else if (w >= 1024) setVisibleCount(4);
            else if (w >= 768) setVisibleCount(3);
            else setVisibleCount(2);
        };

        updateCount();
        window.addEventListener("resize", updateCount);
        return () => window.removeEventListener("resize", updateCount);
    }, []);

    useEffect(() => {
        if (isPaused || trending.length <= 1) return;

        const id = setInterval(() => {
            setActiveIndex((i) => (i + 1) % trending.length);
        }, 6000);

        return () => clearInterval(id);
    }, [trending.length, isPaused]);

    const meal = trending[activeIndex];

    const handleOpenModal = () => {
        setIsPaused(true);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setIsPaused(false);
    };

    if (!meal) {
        return (
            <section className="py-20 bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
                <p className="text-gray-400">جاري تحميل الوصفات الرائجة...</p>
            </section>
        );
    }

    return (
        <section className="relative w-full py-12 px-4 md:px-8 bg-gradient-to-b from-gray-900 via-black to-gray-900 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-60">
                <div className="absolute top-10 left-10 w-64 h-64 bg-green-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-10 right-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl animate-pulse"></div>
            </div>

            <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 lg:gap-12 items-center relative z-10">
                <div
                    className={`${
                        lang === "ar" ? "text-right" : "text-left"
                    } space-y-5`}
                >
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600/20 to-amber-600/20 px-4 py-2 rounded-full text-sm text-green-300 border border-green-500/30">
                        <Star className="w-4 h-4 animate-pulse" />
                        {lang === "ar" ? "رائج هذا الأسبوع" : "Weekly Trending"}
                    </div>

                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight bg-gradient-to-r from-white via-green-100 to-amber-100 bg-clip-text text-transparent">
                        {meal.strMeal}
                    </h1>

                    <div
                        className={`flex gap-3 flex-wrap ${
                            lang === "ar" ? "justify-end" : "justify-start"
                        }`}
                    >
                        <span className="flex items-center gap-2 px-4 py-1.5 bg-gray-800/70 rounded-full border border-gray-700 text-xs">
                            <ChefHat className="w-4 h-4 text-green-400" />
                            {meal.strCategory}
                        </span>

                        <span className="flex items-center gap-2 px-4 py-1.5 bg-gray-800/70 rounded-full border border-gray-700 text-xs">
                            <Globe className="w-4 h-4 text-amber-400" />
                            {meal.strArea}
                        </span>
                    </div>

                    <button
                        onClick={handleOpenModal}
                        className="group inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 rounded-xl text-white font-semibold hover:scale-105 transition shadow-lg"
                    >
                        {lang === "ar" ? "عرض الوصفة" : "View Recipe"}
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
                    </button>

                    <div className="relative mt-8">
                        <button
                            onClick={() =>
                                activeIndex > 0 &&
                                setActiveIndex(activeIndex - 1)
                            }
                            className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full flex items-center justify-center bg-white/10 backdrop-blur-sm transition ${
                                activeIndex > 0
                                    ? "hover:bg-white/20"
                                    : "opacity-50 cursor-not-allowed"
                            }`}
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>

                        <button
                            onClick={() =>
                                activeIndex < trending.length - visibleCount &&
                                setActiveIndex(activeIndex + 1)
                            }
                            className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full flex items-center justify-center bg-white/10 backdrop-blur-sm transition ${
                                activeIndex < trending.length - visibleCount
                                    ? "hover:bg-white/20"
                                    : "opacity-50 cursor-not-allowed"
                            }`}
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>

                        <div className="overflow-hidden px-12">
                            <div
                                className="flex gap-3 transition-transform duration-500 ease-out"
                                style={{
                                    transform: `translateX(${
                                        lang === "ar" ? "" : "-"
                                    }${activeIndex * 112}px)`,
                                }}
                            >
                                {trending.map((item, idx) => (
                                    <button
                                        key={item.idMeal}
                                        onClick={() => setActiveIndex(idx)}
                                        className={`flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden border-2 transition-all ${
                                            idx === activeIndex
                                                ? "border-green-500 shadow-lg scale-105"
                                                : "border-gray-700 opacity-70 hover:opacity-100 hover:border-amber-500"
                                        }`}
                                    >
                                        <img
                                            src={item.strMealThumb}
                                            alt={item.strMeal}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-center md:justify-end">
                    <div className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-700/50">
                        <div className="relative">
                            <img
                                src={meal.strMealThumb}
                                alt={meal.strMeal}
                                className="w-full h-64 md:h-80 object-cover"
                            />
                            <div className="absolute top-3 right-3 bg-gradient-to-r from-green-500 to-amber-500 text-white px-4 py-1.5 rounded-full flex items-center gap-2 text-xs font-bold shadow-lg">
                                <TrendingUp className="w-4 h-4" />
                                Trending #{activeIndex + 1}
                            </div>
                        </div>

                        <div className="p-5 bg-gray-900/95 backdrop-blur-sm">
                            <h3 className="text-xl font-bold text-white mb-2">
                                {meal.strMeal}
                            </h3>
                            <p className="text-gray-400 text-sm line-clamp-3">
                                {(meal.strInstructions || "").substring(0, 140)}
                                ...
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {showModal && meal && (
                <RecipeModal meal={meal} onClose={handleCloseModal} />
            )}
        </section>
    );
}
