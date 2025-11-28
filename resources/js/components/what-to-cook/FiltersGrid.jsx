export default function FiltersGrid({
    mood,
    setMood,
    time,
    setTime,
    difficulty,
    setDifficulty,
    servings,
    setServings,
    lang,
    t,
}) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
                <label className="font-medium block mb-2 text-sm">
                    {t("نوع الطبخة:", "Cooking mood:")}
                </label>
                <select
                    className="w-full bg-gray-800 border border-gray-600 rounded-xl p-3 focus:ring-2 focus:ring-green-500 transition-all"
                    value={mood}
                    onChange={(e) => setMood(e.target.value)}
                >
                    <option value="quick">{t("سريعة ⚡", "Quick ⚡")}</option>
                    <option value="healthy">
                        {t("صحية 🥗", "Healthy 🥗")}
                    </option>
                    <option value="comfort">
                        {t("دسمة 🍲", "Comfort 🍲")}
                    </option>
                    <option value="high-protein">
                        {t("بروتين عالي 💪", "High Protein 💪")}
                    </option>
                </select>
            </div>

            <div>
                <label className="font-medium block mb-2 text-sm">
                    {t("الوقت المتاح:", "Available time:")}
                </label>
                <select
                    className="w-full bg-gray-800 border border-gray-600 rounded-xl p-3 focus:ring-2 focus:ring-green-500 transition-all"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                >
                    <option value="15">{t("15 دقيقة", "15 min")}</option>
                    <option value="30">{t("30 دقيقة", "30 min")}</option>
                    <option value="45">{t("45 دقيقة", "45 min")}</option>
                    <option value="60">{t("ساعة", "1 hour")}</option>
                    <option value="90">{t("ساعة ونصف", "1.5 hours")}</option>
                </select>
            </div>

            <div>
                <label className="font-medium block mb-2 text-sm">
                    {t("الصعوبة:", "Difficulty:")}
                </label>
                <select
                    className="w-full bg-gray-800 border border-gray-600 rounded-xl p-3 focus:ring-2 focus:ring-green-500 transition-all"
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                >
                    <option value="easy">{t("سهل 🟢", "Easy 🟢")}</option>
                    <option value="medium">{t("متوسط 🟡", "Medium 🟡")}</option>
                    <option value="hard">{t("صعب 🔴", "Hard 🔴")}</option>
                </select>
            </div>

            <div>
                <label className="font-medium block mb-2 text-sm">
                    {t("عدد الأشخاص:", "Servings:")}
                </label>
                <select
                    className="w-full bg-gray-800 border border-gray-600 rounded-xl p-3 focus:ring-2 focus:ring-green-500 transition-all"
                    value={servings}
                    onChange={(e) => setServings(e.target.value)}
                >
                    <option value="1">1 {t("شخص", "person")}</option>
                    <option value="2">2 {t("أشخاص", "people")}</option>
                    <option value="4">4 {t("أشخاص", "people")}</option>
                    <option value="6">6 {t("أشخاص", "people")}</option>
                    <option value="8">8 {t("أشخاص", "people")}</option>
                </select>
            </div>
        </div>
    );
}
