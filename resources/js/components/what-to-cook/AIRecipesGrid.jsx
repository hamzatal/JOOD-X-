import React, { useEffect, useState } from "react";
import axios from "axios";
import RecipeCard from "./RecipeCard";
import RecipeModal from "./RecipeModal";
import { useLang } from "@/context/LangContext";

export default function AIRecipesGrid() {
    const { lang } = useLang();
    const [recipes, setRecipes] = useState([]);
    const [updatedAt, setUpdatedAt] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all"); // all | en | ar
    const [selected, setSelected] = useState(null);
    const [generating, setGenerating] = useState(false);

    async function fetchRecipes() {
        setLoading(true);
        try {
            const res = await axios.get("/api/ai-recipes");
            if (res.data) {
                setRecipes(res.data.recipes || []);
                setUpdatedAt(res.data.updated_at || null);
            }
        } catch (err) {
            console.error("Failed to load AI recipes", err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchRecipes();
    }, []);

    async function regenerate() {
        setGenerating(true);
        try {
            await axios.post("/api/ai-recipes/generate", { lang });
            // after success, re-fetch
            await fetchRecipes();
        } catch (err) {
            console.error("regenerate error", err);
            alert(
                lang === "ar"
                    ? "حصل خطأ عند التوليد"
                    : "Error generating recipes"
            );
        } finally {
            setGenerating(false);
        }
    }

    const filtered = recipes.filter((r) =>
        filter === "all" ? true : (r.lang || "en").startsWith(filter)
    );

    return (
        <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-4 shadow-lg">
            <div className="flex items-center justify-between mb-3">
                <div>
                    <h4 className="font-semibold">
                        {lang === "ar" ? "وصفات مبتكرة" : "AI-Invented Recipes"}
                    </h4>
                    <div className="text-xs text-gray-400">
                        {updatedAt
                            ? `${
                                  lang === "ar" ? "آخر تحديث" : "Updated"
                              }: ${new Date(updatedAt).toLocaleString()}`
                            : lang === "ar"
                            ? "توليد كل 24 ساعة"
                            : "Auto-generated every 24h"}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm"
                    >
                        <option value="all">
                            {lang === "ar" ? "الكل" : "All"}
                        </option>
                        <option value="en">English</option>
                        <option value="ar">العربي</option>
                    </select>
                    <button
                        onClick={regenerate}
                        disabled={generating}
                        className="px-3 py-1 bg-green-600 rounded text-sm text-white"
                    >
                        {generating
                            ? lang === "ar"
                                ? "يجري التوليد..."
                                : "Generating..."
                            : lang === "ar"
                            ? "توليد"
                            : "Generate"}
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="py-8 text-center text-gray-400">
                    {lang === "ar" ? "جارٍ التحميل" : "Loading..."}
                </div>
            ) : filtered.length === 0 ? (
                <div className="py-8 text-center text-gray-400">
                    {lang === "ar" ? "لا توجد وصفات" : "No recipes yet"}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {filtered.map((r) => (
                        <RecipeCard
                            key={r.id}
                            recipe={r}
                            onView={() => setSelected(r)}
                        />
                    ))}
                </div>
            )}
            {selected && (
                <RecipeModal
                    meal={selected}
                    onClose={() => setSelected(null)}
                />
            )}
        </div>
    );
}
