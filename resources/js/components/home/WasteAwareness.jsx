import { useLang } from "@/context/LangContext";
import { Leaf, Recycle, Utensils } from "lucide-react";

export default function WasteAwareness() {
    const { t, lang } = useLang();
    const isRTL = lang === "ar";

    const icons = [
        <Utensils className="w-9 h-9 text-green-400" />,
        <Recycle className="w-9 h-9 text-green-400" />,
        <Leaf className="w-9 h-9 text-green-400" />,
    ];

    const tips = t("waste.tips") || []; // ← array from JSON

    return (
        <section className="py-20 px-6 bg-gradient-to-b from-gray-900 to-gray-800">
            <div className="max-w-7xl mx-auto">
                <h2
                    className={`text-3xl font-bold text-white mb-3 ${
                        isRTL && "text-right"
                    }`}
                >
                    {t("waste.title")}
                </h2>

                <p
                    className={`text-gray-400 mb-10 max-w-2xl ${
                        isRTL && "text-right"
                    }`}
                >
                    {t("waste.desc")}
                </p>

                {/* <div className="grid md:grid-cols-3 gap-6">
                    {tips.map((tip, index) => (
                        <div
                            key={index}
                            className="bg-gray-800/50 backdrop-blur border border-gray-700 p-6 rounded-2xl shadow-lg hover:border-green-500 transition"
                        >
                            <div className="mb-4">{icons[index]}</div>
                            <h3 className="text-lg font-semibold text-white mb-2">
                                {tip}
                            </h3>
                        </div>
                    ))}
                </div> */}
            </div>
        </section>
    );
}
