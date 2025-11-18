import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import HeroTrendSection from "@/components/HeroTrendSection";
import AIRecipesSection from "@/components/AIRecipesSection";
import Footer from "@/components/Footer";
import { useLang } from "@/context/LangContext";

export default function Home() {
    const { lang } = useLang();

    useEffect(() => {
        document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    }, [lang]);

    return (
        <div className="min-h-screen bg-black text-gray-200">
            <Navbar />
            <HeroTrendSection />
            <AIRecipesSection />
            <Footer />
        </div>
    );
}
