import { useEffect, useState } from "react";
import { Head, Link } from "@inertiajs/react";
import { Sparkles, ChefHat, ArrowRight, Lightbulb } from "lucide-react";
import { useTranslation } from "react-i18next";
import Navbar from "@/components/Navbar";

export default function Home({ hero = {} }) {
    const { t, i18n } = useTranslation();
    const [mounted, setMounted] = useState(false);
    const [isLoggedIn] = useState(false);
    const [isAdmin] = useState(false);

    useEffect(() => {
        setMounted(true);
        const saved = sessionStorage.getItem("locale");
        if (saved) i18n.changeLanguage(saved);
    }, [i18n]);

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300 flex flex-col">
            <Head title="JOOD - Smart Cooking Assistant" />

            {/* Navbar */}
            <Navbar isLoggedIn={isLoggedIn} isAdmin={isAdmin} />

            {/* Floating background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div
                    className={`absolute top-20 ${
                        i18n.language === "ar" ? "right-20" : "left-20"
                    } w-72 h-72 bg-green-400/20 dark:bg-green-500/10 rounded-full blur-3xl ${
                        mounted ? "animate-pulse" : ""
                    }`}
                    style={{ animationDuration: "4s" }}
                ></div>
                <div
                    className={`absolute bottom-20 ${
                        i18n.language === "ar" ? "left-20" : "right-20"
                    } w-96 h-96 bg-green-500/15 dark:bg-green-600/10 rounded-full blur-3xl ${
                        mounted ? "animate-pulse" : ""
                    }`}
                    style={{ animationDuration: "6s", animationDelay: "1s" }}
                ></div>
            </div>

            {/* Hero Section - RTL/LTR */}
            <section className="relative w-full flex flex-col items-center justify-center text-center px-6 py-24 md:py-12 flex-1">
                <div
                    className={`max-w-7xl w-full grid md:grid-cols-2 gap-12 items-center ${
                        i18n.language === "ar" ? "md:grid-flow-row-dense" : ""
                    }`}
                >
                    {/* Text */}
                    <div
                        className={`space-y-6 ${
                            i18n.language === "ar"
                                ? "md:order-2 text-right"
                                : "md:order-1 text-left"
                        } ${mounted ? "animate-fade-in" : "opacity-0"}`}
                    >
                        <h1
                            className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white leading-tight"
                            dangerouslySetInnerHTML={{
                                __html:
                                    hero.title?.[i18n.language] ||
                                    t("hero.title"),
                            }}
                        />
                        <span
                            className="block mt-2 bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent text-5xl md:text-7xl font-bold"
                            dangerouslySetInnerHTML={{
                                __html: t("hero.withJood"),
                            }}
                        />
                        <p
                            className="mt-6 text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl leading-relaxed"
                            style={{ animationDelay: "200ms" }}
                        >
                            {hero.desc?.[i18n.language] || t("hero.desc")}
                        </p>
                        <button
                            className={`mt-8 px-8 py-4 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl font-semibold shadow-lg shadow-green-500/30 flex items-center gap-2 mx-auto md:mx-0 hover:shadow-xl hover:shadow-green-500/40 hover:scale-105 active:scale-95 transition-all duration-300 ${
                                mounted ? "animate-fade-in" : "opacity-0"
                            }`}
                            style={{ animationDelay: "400ms" }}
                        >
                            {hero.cta?.[i18n.language] || t("hero.tryNow")}{" "}
                            <ArrowRight size={20} />
                        </button>
                    </div>

                    {/* Image */}
                    <div
                        className={`flex justify-center ${
                            i18n.language === "ar" ? "md:order-1" : "md:order-2"
                        }`}
                    >
                        <img
                            src={hero.image || "/images/hero-cooking.jpg"}
                            alt="Cooking with JOOD"
                            className="w-full max-w-md rounded-3xl shadow-2xl object-cover"
                            onError={(e) =>
                                (e.target.src = "/images/logo.png")
                            }
                        />
                    </div>
                </div>

                {/* Decorative */}
                {/* <div
                    className={`absolute top-32 ${
                        i18n.language === "ar"
                            ? "right-10 md:right-20"
                            : "left-10 md:left-20"
                    } opacity-20 dark:opacity-10`}
                >
                    <ChefHat className="w-16 h-16 md:w-24 md:h-24 text-green-500" />
                </div>
                <div
                    className={`absolute bottom-32 ${
                        i18n.language === "ar"
                            ? "left-10 md:left-20"
                            : "right-10 md:right-20"
                    } opacity-20 dark:opacity-10`}
                >
                    <Sparkles className="w-16 h-16 md:w-20 md:h-20 text-green-500" />
                </div> */}
            </section>

            {/* Features Section */}
            <section className="relative px-6 py-20 bg-gray-50 dark:bg-gray-800/40">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                            {t("features.title")}
                        </h2>
                        <p className="text-lg text-gray-600 dark:text-gray-300">
                            {t("features.subtitle")}
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Sparkles,
                                title: t("features.aiRecipe"),
                                desc: t("features.aiRecipeDesc"),
                            },
                            {
                                icon: ChefHat,
                                title: t("features.missingIng"),
                                desc: t("features.missingIngDesc"),
                            },
                            {
                                icon: Lightbulb,
                                title: t("features.smartAssistant"),
                                desc: t("features.smartAssistantDesc"),
                            },
                        ].map((feature, i) => (
                            <div
                                key={i}
                                className={`bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 group ${
                                    mounted ? "animate-slide-up" : "opacity-0"
                                }`}
                                style={{ animationDelay: `${i * 100}ms` }}
                            >
                                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-green-500/30 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                                    <feature.icon className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                    {feature.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <style jsx>{`
                @keyframes fade-in {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @keyframes slide-up {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fade-in {
                    animation: fade-in 0.6s ease-out forwards;
                }
                .animate-slide-up {
                    animation: slide-up 0.6s ease-out forwards;
                }
            `}</style>
        </div>
    );
}
