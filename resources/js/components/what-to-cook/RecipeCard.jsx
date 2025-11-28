import {
    Heart,
    Bookmark,
    Clock,
    Flame,
    Users,
    BarChart3,
    TrendingUp,
} from "lucide-react";

export default function RecipeCard({
    recipe,
    favorites,
    saved,
    servings,
    toggleFavorite,
    toggleSaved,
    openModal,
    lang,
    t,
}) {
    return (
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-green-500/20 transition-all duration-300 transform hover:scale-[1.02] cursor-pointer group">
            <div className="relative h-56 overflow-hidden">
                <img
                    src={recipe.image}
                    alt={recipe.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onClick={() => openModal(recipe)}
                />
                <div className="absolute top-3 right-3 flex gap-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(recipe.title);
                        }}
                        className="p-2 bg-gray-900/80 backdrop-blur-sm rounded-full hover:bg-red-600 transition-all"
                    >
                        <Heart
                            className="w-5 h-5"
                            fill={
                                favorites.includes(recipe.title)
                                    ? "#ef4444"
                                    : "none"
                            }
                            color={
                                favorites.includes(recipe.title)
                                    ? "#ef4444"
                                    : "white"
                            }
                        />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleSaved(recipe.title);
                        }}
                        className="p-2 bg-gray-900/80 backdrop-blur-sm rounded-full hover:bg-green-600 transition-all"
                    >
                        <Bookmark
                            className="w-5 h-5"
                            fill={
                                saved.includes(recipe.title)
                                    ? "#22c55e"
                                    : "none"
                            }
                            color={
                                saved.includes(recipe.title)
                                    ? "#22c55e"
                                    : "white"
                            }
                        />
                    </button>
                </div>
                {recipe.cuisine && (
                    <div className="absolute bottom-3 left-3">
                        <span className="px-3 py-1 bg-green-600/90 backdrop-blur-sm text-white text-xs font-semibold rounded-full">
                            {recipe.cuisine}
                        </span>
                    </div>
                )}
            </div>

            <div className="p-5" onClick={() => openModal(recipe)}>
                <h3 className="text-xl font-bold mb-2 line-clamp-1">
                    {recipe.title}
                </h3>
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {recipe.description}
                </p>

                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-green-400" />
                        <span>
                            {recipe.cookTime} {t("د", "min")}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <Flame className="w-4 h-4 text-orange-400" />
                        <span>
                            {recipe.calories} {t("سعرة", "cal")}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <Users className="w-4 h-4 text-blue-400" />
                        <span>
                            {servings} {t("أشخاص", "servings")}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <BarChart3 className="w-4 h-4 text-purple-400" />
                        <span>{recipe.protein}</span>
                    </div>
                </div>

                {recipe.tags && recipe.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {recipe.tags.slice(0, 3).map((tag, idx) => (
                            <span
                                key={idx}
                                className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-lg"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                )}

                <button className="w-full py-2 bg-green-600 hover:bg-green-500 rounded-xl text-white font-medium transition-colors flex items-center justify-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    {t("عرض التفاصيل", "View Details")}
                </button>
            </div>
        </div>
    );
}
