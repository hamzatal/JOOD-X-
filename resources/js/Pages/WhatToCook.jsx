import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatAssistant from "@/components/what-to-cook/ChatAssistant";
import Wizard from "@/components/what-to-cook/Wizard";
import AIRecipesGrid from "@/components/what-to-cook/AIRecipesGrid";
import SearchCook from "@/components/what-to-cook/SearchCook";
import { useLang } from "@/context/LangContext";

export default function WhatToCook() {
    const { lang } = useLang();
    const [tab, setTab] = useState("chat"); // chat | wizard | hybrid | search

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 text-gray-200">
            <Navbar />
            <main className="max-w-7xl mx-auto px-6 py-12">
                <header className="mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-300 via-amber-300 to-white">
                        {lang === "ar"
                            ? "ماذا أطبخ اليوم؟"
                            : "What to Cook Today?"}
                    </h1>
                    <p className="text-gray-400 mt-2">
                        {lang === "ar"
                            ? "اختر طريقة: دردشة ذكية، خطوات سريعة، اقتراحات أو بحث سريع"
                            : "Choose your flow: Smart chat, quick wizard, curated grid, or quick search"}
                    </p>
                </header>

                {/* Tabs */}
                <div className="flex gap-3 mb-8">
                    <button
                        onClick={() => setTab("chat")}
                        className={`px-4 py-2 rounded-xl ${
                            tab === "chat"
                                ? "bg-gradient-to-r from-green-600 to-green-500"
                                : "bg-gray-800/60"
                        }`}
                    >
                        Chat
                    </button>
                    <button
                        onClick={() => setTab("wizard")}
                        className={`px-4 py-2 rounded-xl ${
                            tab === "wizard"
                                ? "bg-gradient-to-r from-amber-600 to-amber-500"
                                : "bg-gray-800/60"
                        }`}
                    >
                        Wizard
                    </button>
                    <button
                        onClick={() => setTab("hybrid")}
                        className={`px-4 py-2 rounded-xl ${
                            tab === "hybrid"
                                ? "bg-gradient-to-r from-indigo-600 to-indigo-500"
                                : "bg-gray-800/60"
                        }`}
                    >
                        Hybrid
                    </button>
                    <button
                        onClick={() => setTab("search")}
                        className={`px-4 py-2 rounded-xl ${
                            tab === "search"
                                ? "bg-gradient-to-r from-green-600 to-green-500"
                                : "bg-gray-800/60"
                        }`}
                    >
                        Quick Search
                    </button>
                </div>

                <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left column: main content (wide) */}
                    <div className="lg:col-span-2 space-y-6">
                        {tab === "chat" && <ChatAssistant />}
                        {tab === "wizard" && <Wizard />}
                        {tab === "hybrid" && (
                            <div className="grid lg:grid-cols-2 gap-6">
                                <ChatAssistant />
                                <AIRecipesGrid />
                            </div>
                        )}
                        {tab === "search" && <SearchCook />}
                    </div>

                    {/* Right column: side panels (AI recipes grid + helpful tools) */}
                    <aside className="space-y-6">
                        <AIRecipesGrid />
                        {/* Small tips or quick filters */}
                        <div className="bg-gray-900/70 border border-gray-800 rounded-xl p-4">
                            <h4 className="font-semibold mb-2">
                                {lang === "ar" ? "نصائح" : "Tips"}
                            </h4>
                            <ul className="text-sm text-gray-300 space-y-2">
                                <li>
                                    •{" "}
                                    {lang === "ar"
                                        ? "استخدم مكوناتك المتوفرة"
                                        : "Use ingredients you have"}
                                </li>
                                <li>
                                    •{" "}
                                    {lang === "ar"
                                        ? "اطلب وصفة مشابهة"
                                        : "Ask for a similar recipe"}
                                </li>
                                <li>
                                    •{" "}
                                    {lang === "ar"
                                        ? "ولّد وصفات جديدة عند الحاجة"
                                        : "Regenerate recipes if needed"}
                                </li>
                            </ul>
                        </div>
                    </aside>
                </section>
            </main>
            <Footer />
        </div>
    );
}
