// resources/js/components/kids/KidsMealCard.jsx
import React from "react";

export default function KidsMealCard({ meal, onOpen, lang = "en" }) {
    const title = lang === "ar" ? meal.titleAr || meal.title : meal.title;
    const category =
        lang === "ar" ? meal.categoryAr || meal.category : meal.category;
    const time = meal.time || meal.cookTime || meal.prepTime || "30";

    return (
        <div
            className="group bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl overflow-hidden border border-gray-700 hover:border-green-500 transition shadow-lg cursor-pointer"
            onClick={onOpen}
        >
            <div className="relative h-40 overflow-hidden">
                <img
                    src={meal.image}
                    alt={title}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-green-600 text-white px-2 py-1 rounded text-xs font-semibold">
                    {meal.rating || "4.7"}
                </div>
            </div>

            <div className="p-4">
                <h4 className="font-semibold text-white mb-1 line-clamp-2">
                    {title}
                </h4>
                <div className="flex items-center justify-between text-xs text-gray-300">
                    <span className="px-2 py-1 rounded bg-gray-800/60">
                        {category}
                    </span>
                    <span>
                        {time} {lang === "ar" ? "دقيقة" : "min"}
                    </span>
                </div>
            </div>
        </div>
    );
}
