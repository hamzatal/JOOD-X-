import React, { useEffect } from "react";
import { X } from "lucide-react";
import { useLang } from "@/context/LangContext";

/**
 * RecipeModal: displays a full recipe.
 * Acceptable ingredient forms:
 * - string (e.g. "1 cup rice")
 * - object { item, amount, notes } or { ingredient, measure }
 * - array of those
 */
export default function RecipeModal({ meal, onClose }) {
    const { lang } = useLang();

    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => (document.body.style.overflow = "");
    }, []);

    if (!meal) return null;

    const ingredients = Array.isArray(meal.ingredients)
        ? meal.ingredients
        : meal.ingredients
        ? [meal.ingredients]
        : [];
    const subs = meal.substitutions || meal.substitutes || [];
    const warnings = meal.warnings || [];

    function renderIngredient(it, idx) {
        // string
        if (typeof it === "string")
            return (
                <div
                    key={idx}
                    className="flex justify-between bg-gray-800 p-2 rounded"
                >
                    {it}
                </div>
            );

        // object
        if (typeof it === "object" && it !== null) {
            // common keys
            const name =
                it.ingredient ||
                it.item ||
                it.name ||
                Object.values(it)[0] ||
                "";
            const amount =
                it.measure || it.amount || it.qty || it.quantity || "";
            const notes = it.notes || it.note || it.comment || "";

            return (
                <li
                    key={idx}
                    className="flex justify-between bg-gray-800 p-2 rounded"
                >
                    <div className="flex flex-col">
                        <span>{name}</span>
                        {notes ? (
                            <small className="text-gray-400">{notes}</small>
                        ) : null}
                    </div>
                    <span className="text-green-400">{amount}</span>
                </li>
            );
        }

        // fallback
        return (
            <div key={idx} className="bg-gray-800 p-2 rounded">
                {String(it)}
            </div>
        );
    }

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4"
            onClick={onClose}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="bg-gray-900 rounded-3xl w-full max-w-3xl overflow-y-auto max-h-[90vh] border border-gray-800"
            >
                <div className="relative">
                    <img
                        src={meal.image || meal.image_url || meal.img}
                        alt={meal.title}
                        className="w-full h-48 object-cover rounded-t-3xl"
                    />
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 bg-gray-800/70 p-2 rounded text-gray-100"
                    >
                        <X />
                    </button>
                </div>

                <div className="p-5 space-y-4">
                    <h2 className="text-2xl font-bold">{meal.title}</h2>
                    <p className="text-sm text-gray-400">
                        {meal.description || meal.desc}
                    </p>

                    {warnings.length > 0 && (
                        <div className="flex gap-2 flex-wrap">
                            {warnings.map((w, i) => (
                                <span
                                    key={i}
                                    className="px-3 py-1 bg-red-700 text-white rounded"
                                >
                                    {w}
                                </span>
                            ))}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h3 className="font-semibold text-green-400 mb-2">
                                {lang === "ar" ? "المكونات" : "Ingredients"}
                            </h3>
                            <ul className="space-y-2 list-none">
                                {ingredients.map((it, i) =>
                                    renderIngredient(it, i)
                                )}
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-semibold text-amber-400 mb-2">
                                {lang === "ar" ? "البدائل" : "Substitutions"}
                            </h3>
                            {subs.length === 0 ? (
                                <div className="text-gray-400">—</div>
                            ) : (
                                <ul className="space-y-2">
                                    {subs.map((s, i) => (
                                        <li
                                            key={i}
                                            className="bg-gray-800 p-2 rounded"
                                        >
                                            {typeof s === "string"
                                                ? s
                                                : JSON.stringify(s)}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-2">
                            {lang === "ar" ? "الطريقة" : "Instructions"}
                        </h3>
                        <div className="whitespace-pre-line text-sm text-gray-300">
                            {Array.isArray(meal.instructions) ? (
                                meal.instructions.map((st, i) => (
                                    <div key={i} className="mb-2">
                                        • {st}
                                    </div>
                                ))
                            ) : (
                                <div>{meal.instructions}</div>
                            )}
                        </div>
                    </div>

                    {meal.nutrition && (
                        <div className="bg-gray-800 p-3 rounded flex justify-between">
                            <div>
                                {lang === "ar" ? "سعرات" : "Calories"}:{" "}
                                <strong>
                                    {meal.nutrition.calories || "—"}
                                </strong>
                            </div>
                            <div>
                                {lang === "ar" ? "بروتين" : "Protein"}:{" "}
                                <strong>{meal.nutrition.protein || "—"}</strong>
                            </div>
                            <div>
                                {lang === "ar" ? "صوديوم" : "Sodium"}:{" "}
                                <strong>{meal.nutrition.sodium || "—"}</strong>
                            </div>
                        </div>
                    )}

                    <div className="pt-4 flex gap-2">
                        <button className="px-4 py-2 bg-green-600 text-white rounded-xl">
                            {lang === "ar" ? "احفظ" : "Save"}
                        </button>
                        <button
                            onClick={() =>
                                navigator.clipboard.writeText(
                                    `${meal.title}\n\n${
                                        Array.isArray(meal.instructions)
                                            ? meal.instructions.join("\n")
                                            : meal.instructions
                                    }`
                                )
                            }
                            className="px-4 py-2 bg-gray-800 rounded-xl text-gray-200"
                        >
                            {lang === "ar" ? "انسخ" : "Copy"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
