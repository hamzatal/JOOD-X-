import React, { useState } from "react";
import axios from "axios";
import RecipeModal from "./RecipeModal";
import { useLang } from "@/context/LangContext";

export default function Wizard() {
    const { lang } = useLang();
    const isRTL = lang === "ar";

    const [step, setStep] = useState(1);
    const [answers, setAnswers] = useState({
        mood: "",
        people: 2,
        time: "quick",
        type: "",
        ingredients: "",
    });
    const [suggestion, setSuggestion] = useState(null);
    const [loading, setLoading] = useState(false);

    const moods =
        lang === "ar"
            ? ["جوعان", "أبهرهم", "خفيف", "مفاجأة"]
            : ["Starving", "Impress", "Light", "Surprise me"];

    function select(key, value) {
        setAnswers((prev) => ({ ...prev, [key]: value }));
        setTimeout(() => setStep((prev) => Math.min(prev + 1, 5)), 180);
    }

    async function generate() {
        setLoading(true);
        try {
            const promptParts = [
                `Mood: ${answers.mood}`,
                `People: ${answers.people}`,
                `Time: ${answers.time}`,
                `Type: ${answers.type}`,
                `Ingredients: ${answers.ingredients}`,
            ];
            const res = await axios.post("/api/what-to-cook", {
                prompt: promptParts.join(" | "),
                lang,
            });
            if (res.data && res.data.recipe) {
                setSuggestion(res.data.recipe);
            } else {
                setSuggestion({
                    title:
                        lang === "ar"
                            ? "مكرونة بالبيستو والدجاج"
                            : "Chicken Pesto Pasta (fallback)",
                    image: "https://images.unsplash.com/photo-1512058564366-c9e1b9a1a9c5?w=1200&q=80&auto=format&fit=crop",
                    description:
                        lang === "ar" ? "وصفة افتراضية" : "Fallback recipe",
                    ingredients: [
                        { ingredient: "Chicken", measure: "300g" },
                        { ingredient: "Pasta", measure: "250g" },
                    ],
                    instructions: lang === "ar" ? "اسلقي..." : "Boil pasta...",
                });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    function reset() {
        setStep(1);
        setAnswers({
            mood: "",
            people: 2,
            time: "quick",
            type: "",
            ingredients: "",
        });
        setSuggestion(null);
    }

    return (
        <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-6 shadow-lg">
            {!suggestion ? (
                <div>
                    <div className="mb-4">
                        <h4 className="font-semibold">
                            {lang === "ar" ? "خطوات سريعة" : "Quick Wizard"}
                        </h4>
                        <div className="text-sm text-gray-400">
                            {lang === "ar"
                                ? "أجب على الأسئلة التالية"
                                : "Answer a few quick questions"}
                        </div>
                    </div>

                    {step === 1 && (
                        <div className="space-y-3">
                            <h5 className="font-semibold">
                                {lang === "ar"
                                    ? "ما مزاجك؟"
                                    : "How are you feeling?"}
                            </h5>
                            <div className="grid grid-cols-2 gap-3">
                                {moods.map((m) => (
                                    <button
                                        key={m}
                                        onClick={() => select("mood", m)}
                                        className="p-3 bg-gray-800 rounded-xl"
                                    >
                                        {m}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div>
                            <h5 className="font-semibold">
                                {lang === "ar"
                                    ? "كم عدد الأشخاص؟"
                                    : "For how many people?"}
                            </h5>
                            <div className="flex gap-3 mt-3">
                                {[1, 2, 4, 6].map((n) => (
                                    <button
                                        key={n}
                                        onClick={() => select("people", n)}
                                        className="p-3 bg-gray-800 rounded-xl"
                                    >
                                        {n}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div>
                            <h5 className="font-semibold">
                                {lang === "ar"
                                    ? "كم الوقت المتاح؟"
                                    : "How much time?"}
                            </h5>
                            <div className="flex gap-3 mt-3">
                                <button
                                    onClick={() => select("time", "quick")}
                                    className="p-3 bg-gray-800 rounded-xl"
                                >
                                    15m
                                </button>
                                <button
                                    onClick={() => select("time", "medium")}
                                    className="p-3 bg-gray-800 rounded-xl"
                                >
                                    30-45m
                                </button>
                                <button
                                    onClick={() => select("time", "long")}
                                    className="p-3 bg-gray-800 rounded-xl"
                                >
                                    1h+
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div>
                            <h5 className="font-semibold">
                                {lang === "ar"
                                    ? "نوع الطبق؟"
                                    : "Preferred dish type?"}
                            </h5>
                            <div className="flex gap-3 mt-3 flex-wrap">
                                {[
                                    "Pasta",
                                    "Chicken",
                                    "Fish",
                                    "Dessert",
                                    "Salad",
                                ].map((t) => (
                                    <button
                                        key={t}
                                        onClick={() => select("type", t)}
                                        className="p-2 bg-gray-800 rounded-xl"
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 5 && (
                        <div>
                            <h5 className="font-semibold">
                                {lang === "ar"
                                    ? "المكونات (اختياري)"
                                    : "Ingredients (optional)"}
                            </h5>
                            <input
                                type="text"
                                value={answers.ingredients}
                                onChange={(e) =>
                                    setAnswers((prev) => ({
                                        ...prev,
                                        ingredients: e.target.value,
                                    }))
                                }
                                className="mt-2 p-3 bg-gray-800 rounded-xl w-full"
                                placeholder={
                                    lang === "ar"
                                        ? "مثال: دجاج، طماطم..."
                                        : "e.g. chicken, tomatoes..."
                                }
                            />
                            <button
                                onClick={generate}
                                disabled={loading}
                                className="mt-4 w-full py-3 bg-green-600 rounded-xl text-white"
                            >
                                {loading
                                    ? lang === "ar"
                                        ? "جاري..."
                                        : "Generating..."
                                    : lang === "ar"
                                    ? "اقترح لي"
                                    : "Suggest"}
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div>
                    <h4 className="text-lg font-semibold mb-3">
                        {lang === "ar" ? "هذه وصفتك" : "Here is your recipe"}
                    </h4>
                    <div className="bg-gray-800 rounded-xl overflow-hidden">
                        <img
                            src={suggestion.image}
                            alt={suggestion.title}
                            className="w-full h-44 object-cover"
                        />
                        <div className="p-4">
                            <h5 className="font-bold">{suggestion.title}</h5>
                            <p className="text-sm text-gray-400">
                                {suggestion.description}
                            </p>
                            <div className="mt-3">
                                <h6 className="font-semibold">
                                    {lang === "ar" ? "مكونات" : "Ingredients"}
                                </h6>
                                <ul className="mt-2 space-y-1 text-sm">
                                    {suggestion.ingredients.map((it, i) => (
                                        <li
                                            key={i}
                                            className="flex justify-between"
                                        >
                                            <span>{it.ingredient || it}</span>
                                            <span className="text-green-400">
                                                {it.measure || ""}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="mt-3">
                                <h6 className="font-semibold">
                                    {lang === "ar" ? "الطريقة" : "Instructions"}
                                </h6>
                                <div className="text-sm text-gray-300 mt-1 whitespace-pre-line">
                                    {suggestion.instructions}
                                </div>
                            </div>

                            <div className="mt-4 flex gap-2">
                                <button
                                    onClick={reset}
                                    className="flex-1 py-2 bg-green-600 rounded-xl text-white"
                                >
                                    {lang === "ar"
                                        ? "وصفة ثانية"
                                        : "Another recipe"}
                                </button>
                                <button
                                    onClick={() => window.print()}
                                    className="py-2 px-3 bg-gray-800 rounded-xl border border-gray-700"
                                >
                                    {lang === "ar" ? "طباعة" : "Print"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
