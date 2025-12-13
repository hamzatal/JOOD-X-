import React from "react";
import { motion } from "framer-motion";
import {
    BookOpen,
    ChefHat,
    Sparkles,
    Newspaper,
    Lightbulb,
    Heart,
    Apple,
    Coffee,
} from "lucide-react";

const t = (ar, en, lang) => (lang === "ar" ? ar : en);

export default function HeroSection({ lang }) {
    return (
        <section className="relative overflow-hidden bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white py-20 px-6">
            <div className="absolute inset-0 overflow-hidden opacity-10">
                <div className="absolute top-10 left-10 animate-float">
                    <BookOpen size={60} />
                </div>
                <div className="absolute top-20 right-20 animate-float-delayed">
                    <ChefHat size={80} />
                </div>
                <div className="absolute bottom-20 left-1/4 animate-float">
                    <Newspaper size={70} />
                </div>
                <div className="absolute bottom-10 right-1/3 animate-float-delayed">
                    <Apple size={90} />
                </div>
                <div className="absolute top-1/2 left-1/2 animate-float">
                    <Coffee size={65} />
                </div>
            </div>

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
                            <BookOpen size={48} className="text-yellow-200" />
                        </motion.div>
                        <h1 className="text-4xl md:text-6xl font-bold text-white">
                            {t("مجلة جود للطبخ", "Jood Cooking Magazine", lang)}
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
                            <Sparkles size={48} className="text-amber-200" />
                        </motion.div>
                    </div>

                    <p className="text-lg md:text-xl text-green-50 max-w-3xl mx-auto mb-4 leading-relaxed">
                        {t(
                            "عالمك الشامل لأخبار الطبخ، النصائح، الأسرار، والمعلومات الصحية",
                            "Your complete world of cooking news, tips, secrets, and health information",
                            lang
                        )}
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
                        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 hover:scale-105 transition-transform cursor-pointer">
                            <Newspaper size={20} />
                            <span className="text-sm font-medium">
                                {t("أخبار يومية", "Daily News", lang)}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 hover:scale-105 transition-transform cursor-pointer">
                            <Lightbulb size={20} />
                            <span className="text-sm font-medium">
                                {t("نصائح احترافية", "Expert Tips", lang)}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 hover:scale-105 transition-transform cursor-pointer">
                            <Heart size={20} />
                            <span className="text-sm font-medium">
                                {t("معلومات صحية", "Health Info", lang)}
                            </span>
                        </div>
                    </div>
                </motion.div>
            </div>

            <div className="absolute bottom-0 left-0 right-0">
                <svg
                    viewBox="0 0 1440 80"
                    className="w-full h-16 fill-teal-50 dark:fill-gray-950"
                >
                    <path d="M0,40L48,45C96,50,192,60,288,60C384,60,480,50,576,45C672,40,768,40,864,45C960,50,1056,60,1152,60C1248,60,1344,50,1392,45L1440,40L1440,80L0,80Z"></path>
                </svg>
            </div>

            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(5deg); }
                }
                @keyframes float-delayed {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-15px) rotate(-5deg); }
                }
                .animate-float { 
                    animation: float 6s ease-in-out infinite; 
                }
                .animate-float-delayed { 
                    animation: float-delayed 7s ease-in-out infinite; 
                }
            `}</style>
        </section>
    );
}
