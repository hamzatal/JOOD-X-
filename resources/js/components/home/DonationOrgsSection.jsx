import { useLang } from "@/context/LangContext";

export default function DonationOrgsSection() {
    const { t } = useLang();

    return (
        <section className="px-6 md:px-12 py-16 bg-black/40 border-t border-gray-800">
            <div className="max-w-7xl mx-auto">
                <h2 className="text-3xl font-bold text-amber-400 mb-8">
                    {t("donation.title")}
                </h2>

                <div className="grid md:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="bg-gray-900 rounded-2xl border border-gray-700 shadow-lg p-6 hover:scale-[1.02] transition"
                        >
                            <div className="w-20 h-20 bg-gray-700 rounded-full mb-4"></div>

                            <h3 className="text-xl font-semibold text-white mb-2">
                                {t("donation.org_title")} #{i}
                            </h3>

                            <p className="text-gray-300 text-sm mb-3">
                                {t("donation.desc")}
                            </p>

                            <button className="px-4 py-2 rounded-lg bg-amber-600 text-white font-semibold hover:bg-amber-500 transition">
                                {t("donation.contact")}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
