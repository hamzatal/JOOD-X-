import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import HeroTrendSection from "@/components/home/HeroTrendSection";
import CategoriesSection from "@/components/home/CategoriesSection";
import FeaturesSection from "@/components/home/FeaturesSection";
import PopularRecipesSection from "@/components/home/RandomRecipesSection";
import StatsSection from "@/components/home/StatsSection";
import CTASection from "@/components/home/CTASection";
import Footer from "@/components/Footer";
import { useLang } from "@/context/LangContext";

export default function Home() {
    const { lang } = useLang();

    useEffect(() => {
        document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    }, [lang]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-gray-200">
            <Navbar />
            <HeroTrendSection />
            <CategoriesSection />
            <PopularRecipesSection />
            <FeaturesSection />
            <StatsSection />
            <CTASection />
            <Footer />
        </div>
    );
}
