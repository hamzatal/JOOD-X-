import React, { useState } from "react";

export default function PlannerMealCard({ meal, lang }) {
    const [open, setOpen] = useState(false);

    const title =
        lang === "ar" && meal.title_ar
            ? meal.title_ar
            : meal.title || meal.name;
    const instructions =
        lang === "ar" && meal.instructions_ar
            ? meal.instructions_ar
            : meal.instructions;
    const ingredients = meal.ingredients || [];

    return (
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden border border-gray-700">
            <div className="relative h-44">
                <img
                    src={meal.image}
                    alt={title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute bottom-3 left-3 bg-black/60 px-3 py-1 rounded text-white text-sm">
                    {meal.cuisine || ""}
                </div>
            </div>

            <div className="p-4">
                <h4 className="font-semibold">{title}</h4>
                <p className="text-sm text-gray-400 line-clamp-2 mt-1">
                    {meal.description || ""}
                </p>

                <div className="mt-3 flex items-center justify-between">
                    <div className="text-xs text-gray-400">
                        {meal.calories ? `${meal.calories} kcal` : ""}
                    </div>
                    <button
                        onClick={() => setOpen(!open)}
                        className="text-xs text-green-400"
                    >
                        {open
                            ? lang === "ar"
                                ? "إخفاء"
                                : "Hide"
                            : lang === "ar"
                            ? "تفاصيل"
                            : "Details"}
                    </button>
                </div>

                {open && (
                    <div className="mt-3 text-sm text-gray-300">
                        <div className="mb-2">
                            <strong>
                                {lang === "ar" ? "المكونات" : "Ingredients"}:
                            </strong>
                            <ul className="list-disc ml-5 mt-1">
                                {ingredients.map((ing, i) => (
                                    <li key={i}>{ing}</li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <strong>
                                {lang === "ar" ? "التحضير" : "Instructions"}:
                            </strong>
                            <div className="mt-1 text-sm whitespace-pre-line">
                                {instructions}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
