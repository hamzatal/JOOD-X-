import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import HeroTrendSection from "@/components/HeroTrendSection";
// import AIRecipesSection from "@/components/AIRecipesSection";
import Footer from "@/components/Footer";
import { useLang } from "@/context/LangContext";

import WasteAwareness from "@/components/home/WasteAwareness";
import DonationOrgsSection from "@/components/home/DonationOrgsSection";
import HealthAwarenessSection from "@/components/home/HealthAwarenessSection";

export default function Home() {
    const { lang } = useLang();

    useEffect(() => {
        document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    }, [lang]);

    return (
        <div className="min-h-screen bg-black text-gray-200">
            <Navbar />
            <HeroTrendSection />
            {/* <AIRecipesSection /> */}
            <WasteAwareness />
            <DonationOrgsSection />
            <HealthAwarenessSection />

            <Footer />
        </div>
    );
}
