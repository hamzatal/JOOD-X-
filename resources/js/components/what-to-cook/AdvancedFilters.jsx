import { Filter } from "lucide-react";

export default function AdvancedFilters({
    showFilters,
    setShowFilters,
    cuisine,
    setCuisine,
    dietary,
    setDietary,
    lang,
    t,
}) {
    return (
        <>
            <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 text-green-400 hover:text-green-300 transition-colors"
            >
                <Filter className="w-5 h-5" />
                {t("خيارات متقدمة", "Advanced options")}
            </button>

            {showFilters && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-700">
                    <div>
                        <label className="font-medium block mb-2 text-sm">
                            {t("المطبخ:", "Cuisine:")}
                        </label>
                        <select
                            className="w-full bg-gray-800 border border-gray-600 rounded-xl p-3 focus:ring-2 focus:ring-green-500 transition-all"
                            value={cuisine}
                            onChange={(e) => setCuisine(e.target.value)}
                        >
                            <option value="all">{t("الكل", "All")}</option>
                            <option value="arabic">
                                {t("عربي أصيل 🌙", "Authentic Arabic 🌙")}
                            </option>
                            <option value="levantine">
                                {t("شامي 🇸🇾", "Levantine 🇸🇾")}
                            </option>
                            <option value="gulf">
                                {t("خليجي 🇸🇦", "Gulf 🇸🇦")}
                            </option>
                            <option value="mediterranean">
                                {t("متوسطي 🌊", "Mediterranean 🌊")}
                            </option>
                            <option value="asian">
                                {t("آسيوي 🍜", "Asian 🍜")}
                            </option>
                            <option value="italian">
                                {t("إيطالي 🍝", "Italian 🍝")}
                            </option>
                        </select>
                    </div>

                    <div>
                        <label className="font-medium block mb-2 text-sm">
                            {t("النظام الغذائي:", "Dietary:")}
                        </label>
                        <select
                            className="w-full bg-gray-800 border border-gray-600 rounded-xl p-3 focus:ring-2 focus:ring-green-500 transition-all"
                            value={dietary}
                            onChange={(e) => setDietary(e.target.value)}
                        >
                            <option value="none">{t("لا يوجد", "None")}</option>
                            <option value="vegetarian">
                                {t("نباتي 🥬", "Vegetarian 🥬")}
                            </option>
                            <option value="vegan">
                                {t("نباتي صرف 🌱", "Vegan 🌱")}
                            </option>
                            <option value="keto">
                                {t("كيتو 🥑", "Keto 🥑")}
                            </option>
                            <option value="lowcarb">
                                {t("قليل الكربوهيدرات", "Low-carb")}
                            </option>
                        </select>
                    </div>
                </div>
            )}
        </>
    );
}
