import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AIRecipesGrid from "@/components/MedicalRecipes/AIRecipesGrid";
import ChatAssistantMedical from "@/components/MedicalRecipes/ChatAssistantMedical";
import WizardMedical from "@/components/MedicalRecipes/WizardMedical";
import { useLang } from "@/context/LangContext";

export default function MedicalRecipesPage() {
    const { lang } = useLang();
    return (
        <div className="min-h-screen bg-black text-gray-200">
            <Navbar />
            <main className="max-w-7xl mx-auto px-6 py-12">
                <header className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold">
                        {lang === "ar"
                            ? "وصفات طبية مكيّفة"
                            : "Medical Recipes & Health Assistant"}
                    </h1>
                    <p className="text-gray-400 mt-2">
                        {lang === "ar"
                            ? "وصفات مخصصة حسب حالتك الصحية — هذه الصفحة للإرشاد الغذائي فقط."
                            : "Recipes tailored to health conditions — for guidance only."}
                    </p>
                </header>

                <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <AIRecipesGrid />
                        <WizardMedical />
                    </div>

                    <aside className="space-y-6">
                        <ChatAssistantMedical />
                    </aside>
                </section>
            </main>
            <Footer />
        </div>
    );
}
