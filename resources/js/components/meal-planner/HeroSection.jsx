// components/meal-planner/HeroSection.jsx
import React from "react";
import { motion } from "framer-motion";
import {
    Leaf,
    ChefHat,
    Activity,
    HeartPulse,
    RefreshCw,
    Sparkles,
} from "lucide-react";

export default function HeroSection({ lang, onRefresh, loading, refreshing }) {
    const t = (ar, en) => (lang === "ar" ? ar : en);

    return (
        <section className="relative overflow-hidden bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white py-20 px-6">
            {/* Animated Background Icons */}
            <div className="absolute inset-0 overflow-hidden opacity-10">
                <motion.div
                    className="absolute top-10 left-10"
                    animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                >
                    <Leaf size={60} />
                </motion.div>
                <motion.div
                    className="absolute top-20 right-20"
                    animate={{ y: [0, 20, 0], rotate: [0, -10, 0] }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.5,
                    }}
                >
                    <ChefHat size={80} />
                </motion.div>
                <motion.div
                    className="absolute bottom-20 left-1/4"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{
                        duration: 6,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                >
                    <Activity size={70} />
                </motion.div>
                <motion.div
                    className="absolute bottom-10 right-1/3"
                    animate={{ y: [0, -15, 0] }}
                    transition={{
                        duration: 3.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                >
                    <HeartPulse size={90} />
                </motion.div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center"
                >
                    <div className="flex items-center justify-center gap-4 mb-6">
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
                            <HeartPulse size={48} className="text-red-200" />
                        </motion.div>
                        <h1 className="text-5xl md:text-7xl font-bold">
                            {t("خطة الوجبات الأسبوعية", "Weekly Meal Planner")}
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
                            <ChefHat size={48} className="text-amber-200" />
                        </motion.div>
                    </div>

                    <p className="text-xl md:text-2xl text-green-100 max-w-4xl mx-auto mb-8 leading-relaxed">
                        {t(
                            "خطة وجبات كاملة لأسبوع | حساب السعرات والبروتين | قائمة مشتريات ذكية",
                            "Complete weekly meal plan | Calorie & protein tracking | Smart shopping list"
                        )}
                    </p>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onRefresh}
                        disabled={loading || refreshing}
                        className="px-10 py-4 bg-white text-green-700 rounded-2xl font-bold text-lg flex items-center gap-3 shadow-2xl mx-auto hover:shadow-green-200/50 transition-all disabled:opacity-50"
                    >
                        {loading || refreshing ? (
                            <RefreshCw size={24} className="animate-spin" />
                        ) : (
                            <Sparkles size={24} />
                        )}
                        {t("توليد خطة جديدة", "Generate New Plan")}
                    </motion.button>
                </motion.div>
            </div>

            {/* Wave Divider */}
            <div className="absolute bottom-0 left-0 right-0">
                <svg
                    viewBox="0 0 1440 80"
                    className="w-full h-16 fill-gray-950"
                >
                    <path d="M0,40L48,45C96,50,192,60,288,60C384,60,480,50,576,45C672,40,768,40,864,45C960,50,1056,60,1152,60C1248,60,1344,50,1392,45L1440,40L1440,80L0,80Z"></path>
                </svg>
            </div>
        </section>
    );
}
