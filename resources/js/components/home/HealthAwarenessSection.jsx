import { useLang } from "@/context/LangContext";
import { HeartPulse, Droplet, Salad } from "lucide-react";

export default function HealthAwarenessSection() {
    const { t, lang } = useLang();
    const isRTL = lang === "ar";

    const icons = [
        <HeartPulse className="w-9 h-9 text-red-400" />,
        <Droplet className="w-9 h-9 text-blue-400" />,
        <Salad className="w-9 h-9 text-green-400" />,
    ];

    const topics = t("health.topics") || []; // ← array from JSON

    return (
        <section className="py-20 px-6 bg-gradient-to-b from-gray-800 to-gray-900">
            <div className="max-w-7xl mx-auto">
                <h2
                    className={`text-3xl font-bold text-white mb-3 ${
                        isRTL && "text-right"
                    }`}
                >
                    {t("health.title")}
                </h2>

                <p
                    className={`text-gray-400 mb-10 max-w-2xl ${
                        isRTL && "text-right"
                    }`}
                >
                    {t("health.desc")}
                </p>

                {/* <div className="grid md:grid-cols-3 gap-6">
                    {topics.map((topic, index) => (
                        <div
                            key={index}
                            className="bg-gray-900/50 backdrop-blur border border-gray-700 p-6 rounded-2xl shadow-lg hover:border-amber-500 transition"
                        >
                            <div className="mb-4">{icons[index]}</div>
                            <h3 className="text-lg font-semibold text-white mb-2">
                                {topic}
                            </h3>
                        </div>
                    ))}
                </div> */}
            </div>
        </section>
    );
}
