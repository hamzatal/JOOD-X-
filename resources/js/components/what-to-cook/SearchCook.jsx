import React, { useState } from "react";
import axios from "axios";
import RecipeModal from "./RecipeModal";
import { useLang } from "@/context/LangContext";

export default function SearchCook() {
    const { lang } = useLang();
    const [q, setQ] = useState("");
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    async function onSearch() {
        if (!q.trim()) return;
        setLoading(true);
        try {
            const res = await axios.post("/api/what-to-cook", {
                prompt: `Ingredients: ${q}`,
                lang,
            });
            setResult(res.data.recipe || null);
        } catch (err) {
            console.error(err);
            alert(lang === "ar" ? "حصل خطأ" : "Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-4 shadow-lg">
            <h4 className="font-semibold mb-2">
                {lang === "ar" ? "بحث سريع" : "Quick Search"}
            </h4>
            <p className="text-sm text-gray-400 mb-3">
                {lang === "ar"
                    ? "اكتب المكونات مفصولة بفواصل"
                    : "Type ingredients, comma separated"}
            </p>
            <div className="flex gap-2">
                <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder={
                        lang === "ar"
                            ? "مثال: دجاج، طماطم"
                            : "e.g. chicken, tomatoes"
                    }
                    className="flex-1 p-3 bg-gray-800 rounded-xl"
                />
                <button
                    onClick={onSearch}
                    disabled={loading}
                    className="px-4 py-2 bg-green-600 rounded-xl text-white"
                >
                    {loading
                        ? lang === "ar"
                            ? "جاري..."
                            : "Searching..."
                        : lang === "ar"
                        ? "ابحث"
                        : "Search"}
                </button>
            </div>

            {result && (
                <div className="mt-3">
                    <div className="bg-gray-800 rounded-xl p-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="font-semibold">
                                    {result.title}
                                </div>
                                <div className="text-xs text-gray-400">
                                    {result.desc}
                                </div>
                            </div>
                            <img
                                src={result.image}
                                alt={result.title}
                                className="w-20 h-16 object-cover rounded"
                            />
                        </div>
                    </div>
                    <RecipeModal
                        meal={result}
                        onClose={() => setResult(null)}
                    />
                </div>
            )}
        </div>
    );
}
