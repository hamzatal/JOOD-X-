import React, { useEffect } from "react";
import { X } from "lucide-react";
import { useLang } from "@/context/LangContext";

export default function RecipeModal({ meal, onClose }) {
    const { lang } = useLang();
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => (document.body.style.overflow = "");
    }, []);

    if (!meal) return null;

    const ingredients = meal.ingredients || [];

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4"
            onClick={onClose}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="bg-gray-900 rounded-3xl w-full max-w-3xl shadow-xl overflow-y-auto max-h-[90vh] border border-gray-800 custom-scroll"
            >
                <div className="relative">
                    <img
                        src={meal.image}
                        alt={meal.title}
                        className="w-full h-48 object-cover rounded-t-3xl"
                    />
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 bg-gray-800/70 p-2 rounded-md text-gray-200"
                    >
                        <X />
                    </button>
                </div>

                <div className="p-5 space-y-4">
                    <h2 className="text-2xl font-bold">{meal.title}</h2>
                    <p className="text-sm text-gray-400">{meal.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h3 className="font-semibold text-green-400 mb-2">
                                {lang === "ar" ? "المكونات" : "Ingredients"}
                            </h3>

                            <ul className="space-y-2">
                                {ingredients.map((it, idx) => (
                                    <li
                                        key={idx}
                                        className="flex justify-between bg-gray-800 p-2 rounded-md"
                                    >
                                        <span>{it.ingredient || it}</span>
                                        <span className="text-green-400">
                                            {it.measure || ""}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-semibold text-amber-400 mb-2">
                                {lang === "ar" ? "الطريقة" : "Instructions"}
                            </h3>

                            <div className="text-sm text-gray-300 whitespace-pre-line custom-scroll max-h-60 overflow-y-auto">
                                {meal.instructions}
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex gap-2">
                        <button className="px-4 py-2 bg-green-600 text-white rounded-xl">
                            {lang === "ar" ? "احفظ" : "Save"}
                        </button>
                        <button
                            onClick={() =>
                                navigator.clipboard.writeText(
                                    `${meal.title}\n\n${meal.instructions}`
                                )
                            }
                            className="px-4 py-2 bg-gray-800 rounded-xl text-gray-200"
                        >
                            {lang === "ar" ? "نسخ الوصفة" : "Copy"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
