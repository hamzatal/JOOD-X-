// resources/js/components/kids/KidsMealModal.jsx
import React from "react";
import { X } from "lucide-react";

export default function KidsMealModal({ meal, onClose, lang = "en" }) {
    if (!meal) return null;

    const title = lang === "ar" ? meal.titleAr || meal.title : meal.title;
    const instructions =
        lang === "ar"
            ? meal.instructionsAr || meal.instructions
            : meal.instructions;
    const ingredients = meal.ingredients || meal.ingredientsList || [];

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4"
            onClick={onClose}
        >
            <div
                className="bg-gray-900 rounded-3xl w-full max-w-4xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="relative">
                    <img
                        src={meal.image}
                        alt={title}
                        className="w-full h-56 object-cover"
                    />
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 bg-gray-800 p-2 rounded-full"
                    >
                        <X className="w-5 h-5 text-white" />
                    </button>
                </div>
                <div className="p-6">
                    <h2 className="text-2xl font-bold mb-2">{title}</h2>
                    <div className="text-sm text-gray-300 mb-4">
                        {meal.description || meal.desc || ""}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h3 className="font-semibold mb-2">
                                {lang === "ar" ? "المكونات" : "Ingredients"}
                            </h3>
                            <ul className="list-disc ml-5 text-gray-200">
                                {ingredients.length ? (
                                    ingredients.map((ing, idx) => (
                                        <li key={idx}>{ing}</li>
                                    ))
                                ) : (
                                    <li>
                                        {lang === "ar"
                                            ? "لا توجد مكونات"
                                            : "No ingredients"}
                                    </li>
                                )}
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-2">
                                {lang === "ar"
                                    ? "طريقة التحضير"
                                    : "Instructions"}
                            </h3>
                            <div className="text-gray-200 whitespace-pre-line text-sm">
                                {instructions || "-"}
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex gap-3">
                        <button className="px-4 py-2 bg-green-600 text-white rounded-xl">
                            {lang === "ar" ? "حفظ" : "Save"}
                        </button>
                        <button
                            onClick={() => window.print()}
                            className="px-4 py-2 border border-gray-700 rounded-xl"
                        >
                            {lang === "ar" ? "طباعة" : "Print"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
