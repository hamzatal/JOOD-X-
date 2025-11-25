import React, { useState } from "react";
import axios from "axios";
import { useLang } from "@/context/LangContext";

export default function WizardMedical() {
    const { lang } = useLang();
    const [condition, setCondition] = useState("diabetes");
    const [constraints, setConstraints] = useState("");
    const [loading, setLoading] = useState(false);
    const [recipes, setRecipes] = useState([]);

    async function generate() {
        setLoading(true);
        try {
            const res = await axios.post("/api/medical-recipes/generate", {
                lang: lang === "ar" ? "ar" : "en",
                condition,
                constraints,
            });
            if (res.data && res.data.recipes) setRecipes(res.data.recipes);
        } catch (err) {
            console.error(err);
            alert(lang === "ar" ? "فشل التوليد" : "Failed to generate");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-4">
            <h4 className="font-semibold">
                {lang === "ar"
                    ? "توليد وصفات حسب الحالة"
                    : "Generate by condition"}
            </h4>
            <div className="mt-3 space-y-2">
                <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    className="w-full p-2 bg-gray-800 rounded"
                >
                    <option value="diabetes">Diabetes</option>
                    <option value="hypertension">Hypertension</option>
                    <option value="kidney">Kidney Disease</option>
                    <option value="heart">Heart Disease</option>
                    <option value="general">
                        {lang === "ar" ? "عام" : "General"}
                    </option>
                </select>

                <input
                    value={constraints}
                    onChange={(e) => setConstraints(e.target.value)}
                    placeholder={
                        lang === "ar"
                            ? "قيود (مثال: خالي من اللاكتوز، قليل الصوديوم)"
                            : "Constraints (e.g. low sodium, lactose-free)"
                    }
                    className="w-full p-2 bg-gray-800 rounded"
                />

                <button
                    onClick={generate}
                    disabled={loading}
                    className="w-full py-2 bg-green-600 rounded text-white"
                >
                    {loading
                        ? lang === "ar"
                            ? "جاري..."
                            : "Loading..."
                        : lang === "ar"
                        ? "توليد وصفات"
                        : "Generate Recipes"}
                </button>
            </div>

            {recipes.length > 0 && (
                <div className="mt-4 grid grid-cols-1 gap-3">
                    {recipes.map((r) => (
                        <div
                            key={r.id}
                            className="bg-gray-800 p-3 rounded flex items-center gap-3"
                        >
                            <img
                                src={r.image}
                                alt={r.title}
                                className="w-20 h-14 object-cover rounded"
                            />
                            <div>
                                <div className="font-semibold">{r.title}</div>
                                <div className="text-xs text-gray-400">
                                    {r.desc}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
