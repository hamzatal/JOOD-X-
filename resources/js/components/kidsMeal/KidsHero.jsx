import { motion } from "framer-motion";
import {
    RefreshCw,
    Sparkles,
    Smile,
    Heart,
    Apple,
    Cookie,
    IceCream,
    Pizza,
    Baby,
    Cake,
    Clock,
} from "lucide-react";

export default function KidsHero({ lang, onRefresh, refreshing }) {
    const t = (ar, en) => (lang === "ar" ? ar : en);

    return (
        <section className="relative overflow-hidden bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 text-white py-20 px-6">
            {/* خلفية متحركة */}
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

            <div className="max-w-7xl mx-auto relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center"
                >
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
                                "🌟 وجبات الأطفال الصحية",
                                "🌟 Healthy Kids Meals"
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
                            "🥗 وجبات صحية ولذيذة وملونة يحبها كل طفل! 🎉",
                            "🥗 Healthy, Tasty & Colorful Meals Every Kid Loves! 🎉"
                        )}
                    </p>

                    <p className="text-lg text-white/90 max-w-3xl mx-auto mb-8">
                        {t(
                            "وصفات سريعة وسهلة | مكونات صحية | ألوان مبهجة | مناسبة للأعمار 3-10 سنوات",
                            "Quick & Easy Recipes | Healthy Ingredients | Bright Colors | Perfect for Ages 3-10"
                        )}
                    </p>

                    <motion.button
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onRefresh}
                        disabled={refreshing}
                        className="px-12 py-5 bg-white text-green-600 rounded-full font-black text-xl flex items-center gap-4 shadow-2xl mx-auto hover:shadow-green-300/60 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
