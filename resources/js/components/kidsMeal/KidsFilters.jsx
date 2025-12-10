import { motion } from "framer-motion";
import { Coffee, UtensilsCrossed, Moon, Cookie } from "lucide-react";

export default function KidsFilters({
    lang,
    activeCategory,
    onCategoryChange,
}) {
    const t = (ar, en) => (lang === "ar" ? ar : en);

    const categories = [
        {
            id: "all",
            name: t("الكل", "All"),
            icon: <UtensilsCrossed size={20} />,
            color: "from-green-500 to-emerald-500",
        },
        {
            id: "breakfast",
            name: t("فطور", "Breakfast"),
            icon: <Coffee size={20} />,
            color: "from-amber-500 to-orange-500",
        },
        {
            id: "lunch",
            name: t("غداء", "Lunch"),
            icon: <UtensilsCrossed size={20} />,
            color: "from-red-500 to-rose-500",
        },
        {
            id: "dinner",
            name: t("عشاء", "Dinner"),
            icon: <Moon size={20} />,
            color: "from-blue-500 to-indigo-500",
        },
        {
            id: "snack",
            name: t("سناك", "Snack"),
            icon: <Cookie size={20} />,
            color: "from-purple-500 to-pink-500",
        },
    ];

    return (
        <div className="mb-8 flex items-center justify-center gap-3 flex-wrap">
            {categories.map((cat) => (
                <motion.button
                    key={cat.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onCategoryChange(cat.id)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all shadow-lg ${
                        activeCategory === cat.id
                            ? `bg-gradient-to-r ${cat.color} text-white border-2 border-white/50`
                            : "bg-gray-800/60 text-gray-300 border-2 border-gray-700/50 hover:border-green-500/50"
                    }`}
                >
                    {cat.icon}
                    <span>{cat.name}</span>
                </motion.button>
            ))}
        </div>
    );
}
