import { Sparkles, Search, BookMarked, Users, Globe, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useLang } from "@/context/LangContext";

export default function FeaturesSection() {
    const { lang } = useLang();
    const t = (ar, en) => (lang === "ar" ? ar : en);

    const features = [
        {
            icon: Sparkles,
            title: t("مدعوم بالذكاء الاصطناعي", "AI-Powered"),
            description: t(
                "احصل على اقتراحات وصفات ذكية بناءً على مكوناتك",
                "Get smart recipe suggestions based on your ingredients"
            ),
            color: "from-purple-500 to-pink-500",
        },
        {
            icon: Search,
            title: t("بحث متقدم", "Advanced Search"),
            description: t(
                "ابحث بسهولة عن آلاف الوصفات حسب الفئة والمكونات",
                "Easily search thousands of recipes by category and ingredients"
            ),
            color: "from-blue-500 to-cyan-500",
        },
        {
            icon: BookMarked,
            title: t("احفظ المفضلة", "Save Favorites"),
            description: t(
                "احفظ وصفاتك المفضلة وارجع إليها في أي وقت",
                "Save your favorite recipes and access them anytime"
            ),
            color: "from-green-500 to-emerald-500",
        },
        {
            icon: Users,
            title: t("مجتمع نشط", "Active Community"),
            description: t(
                "شارك وصفاتك وتفاعل مع محبي الطبخ",
                "Share your recipes and connect with cooking enthusiasts"
            ),
            color: "from-orange-500 to-red-500",
        },
        {
            icon: Globe,
            title: t("وصفات عالمية", "Global Recipes"),
            description: t(
                "اكتشف أطباق من مختلف المطابخ العالمية",
                "Discover dishes from various international cuisines"
            ),
            color: "from-indigo-500 to-purple-500",
        },
        {
            icon: Zap,
            title: t("تحضير سريع", "Quick Prep"),
            description: t(
                "وصفات سريعة ومناسبة لأوقاتك المزدحمة",
                "Fast recipes perfect for your busy schedule"
            ),
            color: "from-yellow-500 to-amber-500",
        },
    ];

    return (
        <section className="py-16 px-4 md:px-8 bg-gradient-to-b from-black via-gray-900 to-black">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent mb-3">
                        {t("لماذا تختارنا؟", "Why Choose Us?")}
                    </h2>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        {t(
                            "نقدم تجربة فريدة في عالم الطبخ مع مزايا متقدمة",
                            "We offer a unique cooking experience with advanced features"
                        )}
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            whileHover={{ scale: 1.03, y: -5 }}
                            className={`group relative p-6 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 hover:border-gray-600 transition-all overflow-hidden ${
                                lang === "ar" ? "text-right" : "text-left"
                            }`}
                        >
                            <div
                                className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity`}
                            ></div>

                            <div className="relative z-10">
                                <div
                                    className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.color} shadow-lg mb-4`}
                                >
                                    <feature.icon className="w-6 h-6 text-white" />
                                </div>

                                <h3 className="text-xl font-bold text-white mb-2">
                                    {feature.title}
                                </h3>

                                <p className="text-gray-400 text-sm leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
