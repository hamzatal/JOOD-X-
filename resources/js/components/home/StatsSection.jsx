import { motion } from "framer-motion";
import { BookOpen, Users, Star, Globe } from "lucide-react";
import { useLang } from "@/context/LangContext";
import { useEffect, useState } from "react";

export default function StatsSection() {
    const { lang } = useLang();
    const t = (ar, en) => (lang === "ar" ? ar : en);

    const [counters, setCounters] = useState({
        recipes: 0,
        users: 0,
        ratings: 0,
        countries: 0,
    });

    const finalStats = {
        recipes: 10000,
        users: 50000,
        ratings: 4.9,
        countries: 120,
    };

    useEffect(() => {
        const duration = 2000;
        const steps = 60;
        const interval = duration / steps;

        let step = 0;
        const timer = setInterval(() => {
            step++;
            const progress = step / steps;

            setCounters({
                recipes: Math.floor(finalStats.recipes * progress),
                users: Math.floor(finalStats.users * progress),
                ratings: (finalStats.ratings * progress).toFixed(1),
                countries: Math.floor(finalStats.countries * progress),
            });

            if (step >= steps) clearInterval(timer);
        }, interval);

        return () => clearInterval(timer);
    }, []);

    const stats = [
        {
            icon: BookOpen,
            value: `${counters.recipes.toLocaleString()}+`,
            label: t("وصفة متنوعة", "Recipes"),
            color: "from-green-500 to-emerald-500",
        },
        {
            icon: Users,
            value: `${counters.users.toLocaleString()}+`,
            label: t("مستخدم نشط", "Active Users"),
            color: "from-blue-500 to-cyan-500",
        },
        {
            icon: Star,
            value: counters.ratings,
            label: t("تقييم المستخدمين", "User Rating"),
            color: "from-amber-500 to-yellow-500",
        },
        {
            icon: Globe,
            value: `${counters.countries}+`,
            label: t("دولة", "Countries"),
            color: "from-purple-500 to-pink-500",
        },
    ];

    return (
        <section className="py-16 px-4 md:px-8 bg-gradient-to-b from-black to-gray-900">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.5 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1, type: "spring" }}
                            className="text-center p-6 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 hover:border-gray-600 transition-all"
                        >
                            <div
                                className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg mb-4`}
                            >
                                <stat.icon className="w-8 h-8 text-white" />
                            </div>

                            <div
                                className={`text-3xl md:text-4xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-2`}
                            >
                                {stat.value}
                            </div>

                            <div className="text-gray-400 text-sm font-medium">
                                {stat.label}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
