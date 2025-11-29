import {
    UtensilsCrossed,
    Cookie,
    Salad,
    Pizza,
    Coffee,
    IceCream,
} from "lucide-react";
import { motion } from "framer-motion";
import { useLang } from "@/context/LangContext";

export default function CategoriesSection() {
    const { lang } = useLang();
    const t = (ar, en) => (lang === "ar" ? ar : en);

    const categories = [
        {
            icon: Pizza,
            nameAr: "بيتزا وباستا",
            nameEn: "Pizza & Pasta",
            color: "from-red-500 to-orange-500",
            count: "150+",
        },
        {
            icon: Salad,
            nameAr: "سلطات صحية",
            nameEn: "Healthy Salads",
            color: "from-green-500 to-emerald-500",
            count: "120+",
        },
        {
            icon: Cookie,
            nameAr: "حلويات",
            nameEn: "Desserts",
            color: "from-pink-500 to-purple-500",
            count: "200+",
        },
        {
            icon: Coffee,
            nameAr: "مشروبات",
            nameEn: "Beverages",
            color: "from-amber-500 to-yellow-500",
            count: "80+",
        },
        {
            icon: UtensilsCrossed,
            nameAr: "أطباق رئيسية",
            nameEn: "Main Courses",
            color: "from-blue-500 to-cyan-500",
            count: "300+",
        },
        {
            icon: IceCream,
            nameAr: "وجبات خفيفة",
            nameEn: "Snacks",
            color: "from-indigo-500 to-purple-500",
            count: "90+",
        },
    ];

    const handleCategoryClick = (cat) => {
        const label = lang === "ar" ? cat.nameEn : cat.nameEn;
        window.location.href = `/recipes?category=${encodeURIComponent(label)}`;
    };

    return (
        <section className="py-16 px-4 md:px-8 bg-gradient-to-b from-gray-900 to-black">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-400 to-amber-400 bg-clip-text text-transparent mb-3">
                        {t("تصفح حسب الفئة", "Browse by Category")}
                    </h2>
                    <p className="text-gray-400 text-lg">
                        {t(
                            "اكتشف آلاف الوصفات في مختلف الفئات",
                            "Discover thousands of recipes across different categories"
                        )}
                    </p>
                </motion.div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {categories.map((cat, idx) => {
                        const IconComponent = cat.icon;
                        return (
                            <motion.button
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                whileHover={{ scale: 1.05, y: -5 }}
                                onClick={() => handleCategoryClick(cat)}
                                className="group relative p-6 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 hover:border-gray-600 transition-all overflow-hidden"
                            >
                                <div
                                    className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-0 group-hover:opacity-10 transition-opacity`}
                                ></div>

                                <div className="relative z-10 flex flex-col items-center gap-3">
                                    <div
                                        className={`p-3 rounded-xl bg-gradient-to-br ${cat.color} shadow-lg`}
                                    >
                                        <IconComponent className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="font-semibold text-white text-sm text-center">
                                        {lang === "ar"
                                            ? cat.nameAr
                                            : cat.nameEn}
                                    </h3>
                                    <span className="text-xs text-gray-400">
                                        {cat.count}
                                    </span>
                                </div>
                            </motion.button>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
