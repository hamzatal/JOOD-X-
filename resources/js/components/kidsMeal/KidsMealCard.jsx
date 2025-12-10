import { motion } from "framer-motion";
import { ChefHat, Clock, Users, Heart } from "lucide-react";

export default function KidsMealCard({ meal, onOpen, lang }) {
    const t = (ar, en) => (lang === "ar" ? ar : en);
    const title = lang === "ar" && meal.titleAr ? meal.titleAr : meal.title;
    const category =
        lang === "ar" && meal.categoryAr ? meal.categoryAr : meal.category;

    return (
        <motion.div
            whileHover={{ scale: 1.03, y: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={onOpen}
            className="group bg-gradient-to-br from-green-900/40 via-emerald-900/40 to-teal-900/40 rounded-3xl overflow-hidden border-2 border-green-500/30 hover:border-emerald-400 transition-all shadow-xl hover:shadow-emerald-500/30 cursor-pointer"
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
                    <div className="absolute top-3 left-3 bg-green-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
                        {t(`عمر ${meal.age_range}`, `Age ${meal.age_range}`)}
                    </div>
                )}
            </div>

            {/* المحتوى */}
            <div className="p-5">
                <h4 className="font-bold text-white text-lg mb-2 line-clamp-2 group-hover:text-green-300 transition">
                    {title}
                </h4>

                <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                    {meal.description || meal.benefits}
                </p>

                <div className="flex items-center justify-between text-xs text-gray-400 gap-2">
                    <span className="flex items-center gap-1 px-3 py-1.5 bg-green-900/60 rounded-full">
                        <ChefHat size={14} />
                        {category}
                    </span>
                    <span className="flex items-center gap-1 px-3 py-1.5 bg-emerald-900/60 rounded-full">
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
