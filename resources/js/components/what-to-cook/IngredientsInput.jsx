export default function IngredientsInput({
    ingredients,
    setIngredients,
    lang,
    t,
}) {
    return (
        <div>
            <label className="text-lg font-semibold mb-3 block items-center gap-2">
                <span className="text-2xl">🥘</span>
                {t("المكونات المتوفرة:", "Available ingredients:")}
            </label>
            <textarea
                value={ingredients}
                onChange={(e) => setIngredients(e.target.value)}
                placeholder={t(
                    "مثال: دجاج، بطاطا، رز، بصل، ثوم، بندورة...",
                    "Example: chicken, potatoes, rice, onions, garlic, tomatoes..."
                )}
                className="w-full h-32 bg-gray-800 border border-gray-600 rounded-2xl p-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
            ></textarea>
        </div>
    );
}
