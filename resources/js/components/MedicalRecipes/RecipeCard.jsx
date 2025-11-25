import React from "react";

export default function RecipeCard({ recipe, onView }) {
    return (
        <article className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden border border-gray-700 shadow">
            <img
                src={recipe.image || recipe.image_url}
                alt={recipe.title}
                className="w-full h-40 object-cover"
            />
            <div className="p-3">
                <h5 className="font-semibold text-white">{recipe.title}</h5>
                <p className="text-sm text-gray-400 line-clamp-2">
                    {recipe.description}
                </p>
                <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm text-green-400">
                        {recipe.prep_time || recipe.time || "—"}
                    </span>
                    <button
                        onClick={onView}
                        className="px-2 py-1 bg-green-600 rounded text-sm text-white"
                    >
                        View
                    </button>
                </div>
            </div>
        </article>
    );
}
