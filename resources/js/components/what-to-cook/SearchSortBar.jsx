import { Search } from "lucide-react";

export default function SearchSortBar({
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    lang,
    t,
}) {
    return (
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
                <Search className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    placeholder={t("ابحث في الوصفات...", "Search recipes...")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-12 pr-4 py-3 text-white focus:ring-2 focus:ring-green-500 transition-all"
                />
            </div>
            <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 transition-all"
            >
                <option value="relevance">
                    {t("الأكثر صلة", "Most Relevant")}
                </option>
                <option value="time">{t("الأسرع", "Fastest")}</option>
                <option value="calories">
                    {t("الأقل سعرات", "Lowest Calories")}
                </option>
            </select>
        </div>
    );
}
