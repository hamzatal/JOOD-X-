import {
    X,
    Heart,
    Share2,
    Printer,
    Clock,
    Flame,
    BarChart3,
    Star,
    ChefHat,
    Sparkles,
} from "lucide-react";

export default function RecipeModal({
    recipe,
    closeModal,
    favorites,
    toggleFavorite,
    shareRecipe,
    printRecipe,
    lang,
    t,
}) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={closeModal}
        >
            <div
                className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="relative h-72 sm:h-96">
                    <img
                        src={recipe.image}
                        alt={recipe.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent"></div>

                    <button
                        onClick={closeModal}
                        className="absolute top-4 right-4 p-2 bg-gray-900/80 backdrop-blur-sm rounded-full hover:bg-gray-800 transition-all"
                    >
                        <X className="w-6 h-6 text-white" />
                    </button>

                    <div className="absolute bottom-6 left-6 right-6">
                        <h2 className="text-3xl sm:text-4xl font-bold mb-3 text-white drop-shadow-lg">
                            {recipe.title}
                        </h2>
                        <p className="text-gray-200 text-lg mb-4">
                            {recipe.description}
                        </p>

                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={() => toggleFavorite(recipe.title)}
                                className="px-4 py-2 bg-gray-900/80 backdrop-blur-sm rounded-xl hover:bg-red-600 transition-all flex items-center gap-2"
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
                                <span>{t("أعجبني", "Like")}</span>
                            </button>
                            <button
                                onClick={() => shareRecipe(recipe)}
                                className="px-4 py-2 bg-gray-900/80 backdrop-blur-sm rounded-xl hover:bg-blue-600 transition-all flex items-center gap-2"
                            >
                                <Share2 className="w-5 h-5" />
                                <span>{t("مشاركة", "Share")}</span>
                            </button>
                            <button
                                onClick={() => printRecipe(recipe)}
                                className="px-4 py-2 bg-gray-900/80 backdrop-blur-sm rounded-xl hover:bg-green-600 transition-all flex items-center gap-2"
                            >
                                <Printer className="w-5 h-5" />
                                <span>{t("طباعة", "Print")}</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="p-6 sm:p-8">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 p-6 bg-gray-800/50 rounded-2xl">
                        <div className="text-center">
                            <Clock className="w-6 h-6 text-green-400 mx-auto mb-2" />
                            <div className="text-2xl font-bold">
                                {recipe.prepTime}
                            </div>
                            <div className="text-sm text-gray-400">
                                {t("تحضير (د)", "Prep (min)")}
                            </div>
                        </div>
                        <div className="text-center">
                            <Clock className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                            <div className="text-2xl font-bold">
                                {recipe.cookTime}
                            </div>
                            <div className="text-sm text-gray-400">
                                {t("طبخ (د)", "Cook (min)")}
                            </div>
                        </div>
                        <div className="text-center">
                            <Flame className="w-6 h-6 text-orange-400 mx-auto mb-2" />
                            <div className="text-2xl font-bold">
                                {recipe.calories}
                            </div>
                            <div className="text-sm text-gray-400">
                                {t("سعرة", "Calories")}
                            </div>
                        </div>
                        <div className="text-center">
                            <BarChart3 className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                            <div className="text-2xl font-bold">
                                {recipe.protein}
                            </div>
                            <div className="text-sm text-gray-400">
                                {t("بروتين", "Protein")}
                            </div>
                        </div>
                    </div>

                    {recipe.tags && recipe.tags.length > 0 && (
                        <div className="mb-8">
                            <div className="flex flex-wrap gap-2">
                                {recipe.tags.map((tag, idx) => (
                                    <span
                                        key={idx}
                                        className="px-4 py-2 bg-green-600/20 border border-green-600/30 text-green-400 rounded-xl text-sm font-medium flex items-center gap-2"
                                    >
                                        <Star className="w-4 h-4" />
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="mb-8">
                        <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                            <span>📝</span>
                            {t("المكونات:", "Ingredients:")}
                        </h3>
                        <ul className="space-y-3 bg-gray-800/50 rounded-2xl p-6">
                            {recipe.ingredients.map((ing, idx) => (
                                <li
                                    key={idx}
                                    className="flex items-start gap-3"
                                >
                                    <span className="text-green-400 mt-1">
                                        ✓
                                    </span>
                                    <span className="text-gray-200 flex-1">
                                        {ing}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="mb-8">
                        <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                            <ChefHat className="w-7 h-7 text-green-400" />
                            {t("طريقة التحضير:", "Instructions:")}
                        </h3>
                        <div className="bg-gray-800/50 rounded-2xl p-6">
                            <p className="text-gray-200 whitespace-pre-line leading-relaxed">
                                {recipe.instructions}
                            </p>
                        </div>
                    </div>

                    {recipe.tips && (
                        <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-700/30 rounded-2xl p-6">
                            <h3 className="text-xl font-bold mb-3 flex items-center gap-2 text-green-400">
                                <Sparkles className="w-6 h-6" />
                                {t("نصيحة الشيف:", "Chef's Tip:")}
                            </h3>
                            <p className="text-gray-200">{recipe.tips}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
