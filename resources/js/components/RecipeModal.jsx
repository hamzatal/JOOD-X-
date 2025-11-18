import { X, ChefHat, Globe, BookOpen, Sparkles } from "lucide-react";

export default function RecipeModal({ meal, onClose, lang = "en" }) {
    if (!meal) return null;

    const isRTL = lang === "ar";

    const ingredients = Array.from({ length: 20 }, (_, i) => ({
        ingredient: meal[`strIngredient${i + 1}`]?.trim(),
        measure: meal[`strMeasure${i + 1}`]?.trim(),
    })).filter((item) => item.ingredient);

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-lg p-4"
            onClick={onClose}
        >
            <div
                className="bg-gray-900 rounded-3xl shadow-2xl border border-gray-800 w-full max-w-6xl max-h-[88vh] overflow-hidden flex flex-col lg:flex-row"
                onClick={(e) => e.stopPropagation()}
            >
                <div
                    className={`relative flex-shrink-0 ${
                        isRTL ? "lg:order-2" : "lg:order-1"
                    }`}
                >
                    <img
                        src={meal.strMealThumb}
                        alt={meal.strMeal}
                        className="w-full h-64 lg:w-96 lg:h-full object-cover rounded-t-3xl lg:rounded-tr-none lg:rounded-l-3xl"
                    />
                    <div className="absolute bottom-4 left-4 flex gap-3">
                        <span className="flex items-center gap-2 px-4 py-2 bg-green-600/90 backdrop-blur-sm rounded-full text-white text-sm font-semibold border border-green-500/50 shadow-lg">
                            <ChefHat size={16} />
                            {meal.strCategory}
                        </span>
                        <span className="flex items-center gap-2 px-4 py-2 bg-amber-600/90 backdrop-blur-sm rounded-full text-white text-sm font-semibold border border-amber-500/50 shadow-lg">
                            <Globe size={16} />
                            {meal.strArea}
                        </span>
                    </div>
                </div>

                <div
                    className={`flex-1 flex flex-col ${
                        isRTL ? "lg:order-1 text-right" : "lg:order-2 text-left"
                    }`}
                >
                    <div className="flex justify-between items-start p-6 pb-4 border-b border-gray-800">
                        <div className="flex-1 pr-6">
                            <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-green-400 via-green-300 to-amber-400 bg-clip-text text-transparent leading-tight">
                                {meal.strMeal}
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-3 rounded-xl bg-gray-800/80 hover:bg-gray-700 text-gray-400 hover:text-white transition hover:scale-110 shadow-lg"
                        >
                            <X size={28} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar-dark">
                        <div>
                            <h3 className="text-xl font-bold text-green-400 mb-4 flex items-center gap-3">
                                <BookOpen size={24} />
                                {isRTL ? "طريقة التحضير" : "Instructions"}
                            </h3>
                            <p className="text-gray-300 leading-relaxed text-sm md:text-base whitespace-pre-line bg-gray-800/50 p-5 rounded-2xl border border-gray-700/50">
                                {meal.strInstructions}
                            </p>
                        </div>

                        <div>
                            <h3 className="text-xl font-bold text-amber-400 mb-4 flex items-center gap-3">
                                <Sparkles size={24} />
                                {isRTL
                                    ? `المكونات (${ingredients.length})`
                                    : `Ingredients (${ingredients.length})`}
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {ingredients.map(
                                    ({ ingredient, measure }, i) => (
                                        <div
                                            key={i}
                                            className={`flex ${
                                                isRTL
                                                    ? "flex-row-reverse"
                                                    : "flex-row"
                                            } items-center justify-between p-4 bg-gray-800/60 rounded-xl border border-gray-700/50 hover:border-green-500/50 transition-all group`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-amber-400 rounded-full group-hover:scale-150 transition" />
                                                <span className="text-gray-200 font-medium text-sm">
                                                    {ingredient}
                                                </span>
                                            </div>
                                            {measure && (
                                                <span className="text-green-400 font-bold text-xs bg-green-900/40 px-3 py-1.5 rounded-lg">
                                                    {measure}
                                                </span>
                                            )}
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
