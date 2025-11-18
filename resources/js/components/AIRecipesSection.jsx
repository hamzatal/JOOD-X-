import { useEffect, useState } from "react";
import axios from "axios";
import { useLang } from "@/context/LangContext";

/**
 * Frontend expects backend endpoint:
 * GET /api/ai-recipes
 * returns: { updated_at: "2025-11-16T...", recipes: [{ id, title, desc, image, time }] }
 *
 * Fallback: local sample recipes (so page still looks good)
 */

export default function AIRecipesSection() {
    const { t } = useLang();
    const [recipes, setRecipes] = useState([]);
    const [updatedAt, setUpdatedAt] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        const fetchAI = async () => {
            try {
                const res = await axios
                    .get("/api/ai-recipes")
                    .catch(() => null);
                if (res && res.data && mounted) {
                    setRecipes(res.data.recipes || []);
                    setUpdatedAt(res.data.updated_at || null);
                } else if (mounted) {
                    // fallback set
                    setRecipes([
                        {
                            id: "a1",
                            title: "Spicy Honey Garlic Pasta",
                            desc: "AI invented fusion pasta.",
                            image: "/images/ai1.jpg",
                            time: "20 min",
                        },
                        {
                            id: "a2",
                            title: "Crispy Avocado Bites",
                            desc: "A crunchy snack created by AI.",
                            image: "/images/ai2.jpg",
                            time: "10 min",
                        },
                        {
                            id: "a3",
                            title: "Herb Chicken Wrap",
                            desc: "Balanced herbs and cheese wrap.",
                            image: "/images/ai1.jpg",
                            time: "18 min",
                        },
                        {
                            id: "a4",
                            title: "Golden Garlic Rice Bowl",
                            desc: "Savory rice bowl with garlic.",
                            image: "/images/ai2.jpg",
                            time: "15 min",
                        },
                    ]);
                }
            } catch (err) {
                console.error("AI recipes error", err);
            } finally {
                if (mounted) setLoading(false);
            }
        };
        fetchAI();
        return () => (mounted = false);
    }, []);

    return (
        <section className="px-6 md:px-12 py-16 bg-gray-900">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-white">
                        AI-Invented Recipes
                    </h2>
                    <div className="text-sm text-gray-400">
                        {updatedAt
                            ? `Updated: ${new Date(
                                  updatedAt
                              ).toLocaleDateString()}`
                            : "Auto-generated every 3 days"}
                    </div>
                </div>

                <div className="grid md:grid-cols-4 gap-6">
                    {loading ? (
                        <div className="col-span-4 text-center text-gray-400">
                            Loading…
                        </div>
                    ) : recipes.length === 0 ? (
                        <div className="col-span-4 text-center text-gray-400">
                            No recipes yet
                        </div>
                    ) : (
                        recipes.map((r) => (
                            <article
                                key={r.id}
                                className="bg-gray-800 rounded-2xl overflow-hidden shadow"
                            >
                                <img
                                    src={r.image}
                                    alt={r.title}
                                    className="w-full h-40 object-cover"
                                />
                                <div className="p-4">
                                    <h3 className="text-lg font-semibold text-white mb-1">
                                        {r.title}
                                    </h3>
                                    <p className="text-sm text-gray-300 mb-3">
                                        {r.desc}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-green-400 font-semibold">
                                            ⏱ {r.time}
                                        </span>
                                        <button className="px-3 py-1 bg-green-600 text-white rounded-lg">
                                            View
                                        </button>
                                    </div>
                                </div>
                            </article>
                        ))
                    )}
                </div>
            </div>
        </section>
    );
}
