import React, { useState } from "react";
import { motion } from "framer-motion";
import { SearchIcon, XIcon } from "lucide-react";

export default function SearchBar({ onSearch, lang, loading }) {
    const [query, setQuery] = useState("");

    const handleSearch = (e) => {
        e.preventDefault();
        if (query.trim()) {
            onSearch(query);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
        >
            <form
                onSubmit={handleSearch}
                className="relative max-w-3xl mx-auto"
            >
                <SearchIcon
                    size={24}
                    className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={
                        lang === "ar"
                            ? "ابحث عن وصفة..."
                            : "Search for a recipe..."
                    }
                    className="w-full pl-14 pr-14 py-5 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 text-lg text-gray-900 dark:text-white shadow-lg"
                    disabled={loading}
                />
                {query && (
                    <button
                        type="button"
                        onClick={() => setQuery("")}
                        className="absolute right-16 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                        <XIcon size={20} />
                    </button>
                )}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    disabled={loading || !query.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl font-semibold disabled:opacity-50"
                >
                    {lang === "ar" ? "بحث" : "Search"}
                </motion.button>
            </form>
        </motion.div>
    );
}
