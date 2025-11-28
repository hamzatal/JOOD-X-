import { ArrowRight, Sparkles, ChefHat } from "lucide-react";
import { motion } from "framer-motion";
import { useLang } from "@/context/LangContext";

export default function CTASection() {
    const { lang } = useLang();
    const t = (ar, en) => (lang === "ar" ? ar : en);

    const handleNavigate = (path) => {
        window.location.href = path;
    };

    return (
        <section className="py-20 px-4 md:px-8 bg-gradient-to-b from-gray-900 to-black">
            <div className="max-w-5xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="relative overflow-hidden bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-3xl p-8 md:p-12 lg:p-16"
                >
                    {/* Background decoration */}
                    <div className="absolute inset-0 overflow-hidden opacity-10">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{
                                duration: 20,
                                repeat: Infinity,
                                ease: "linear",
                            }}
                            className="absolute -top-20 -left-20"
                        >
                            <ChefHat size={150} />
                        </motion.div>
                        <motion.div
                            animate={{ rotate: -360 }}
                            transition={{
                                duration: 25,
                                repeat: Infinity,
                                ease: "linear",
                            }}
                            className="absolute -bottom-20 -right-20"
                        >
                            <Sparkles size={130} />
                        </motion.div>
                    </div>

                    {/* Content */}
                    <div
                        className={`relative z-10 ${
                            lang === "ar" ? "text-center" : "text-center"
                        }`}
                    >
                        <motion.div
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm font-semibold mb-6"
                        >
                            <Sparkles className="w-4 h-4" />
                            {t("ابدأ رحلتك الآن", "Start Your Journey Now")}
                        </motion.div>

                        <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                            {t(
                                "جاهز لاكتشاف وصفات جديدة؟",
                                "Ready to Discover New Recipes?"
                            )}
                        </h2>

                        <p className="text-base md:text-lg lg:text-xl text-green-50 max-w-2xl mx-auto mb-8 leading-relaxed">
                            {t(
                                "انضم إلى آلاف المستخدمين واستمتع بتجربة طبخ فريدة مع وصفات حلال مخصصة لك",
                                "Join thousands of users and enjoy a unique cooking experience with personalized halal recipes"
                            )}
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleNavigate("/what-to-cook")}
                                className={`group inline-flex items-center gap-2 px-6 md:px-8 py-3 md:py-4 bg-white text-green-600 rounded-xl font-bold text-base md:text-lg hover:shadow-2xl transition-all w-full sm:w-auto justify-center ${
                                    lang === "ar" ? "flex-row-reverse" : ""
                                }`}
                            >
                                {t("اقترح لي وصفة", "Suggest Me a Recipe")}
                                <ArrowRight
                                    className={`w-5 h-5 group-hover:${
                                        lang === "ar"
                                            ? "-translate-x-1"
                                            : "translate-x-1"
                                    } transition`}
                                />
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleNavigate("/recipes")}
                                className={`inline-flex items-center gap-2 px-6 md:px-8 py-3 md:py-4 bg-transparent border-2 border-white text-white rounded-xl font-bold text-base md:text-lg hover:bg-white/10 transition-all w-full sm:w-auto justify-center ${
                                    lang === "ar" ? "flex-row-reverse" : ""
                                }`}
                            >
                                {t("تصفح الوصفات", "Browse Recipes")}
                            </motion.button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
