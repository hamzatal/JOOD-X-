import React from "react";
import { motion } from "framer-motion";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

export default function Pagination({
    currentPage,
    lastPage,
    onPageChange,
    lang,
}) {
    const pages = [];
    const maxVisible = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(lastPage, startPage + maxVisible - 1);

    if (endPage - startPage < maxVisible - 1) {
        startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
    }

    return (
        <div className="flex items-center justify-center gap-2 mt-8">
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:border-green-500 transition"
            >
                {lang === "ar" ? (
                    <ChevronRightIcon size={20} />
                ) : (
                    <ChevronLeftIcon size={20} />
                )}
            </motion.button>

            {startPage > 1 && (
                <>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        onClick={() => onPageChange(1)}
                        className="px-4 py-2 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl font-semibold hover:border-green-500 transition"
                    >
                        1
                    </motion.button>
                    {startPage > 2 && (
                        <span className="text-gray-500">...</span>
                    )}
                </>
            )}

            {pages.map((page) => (
                <motion.button
                    key={page}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onPageChange(page)}
                    className={`px-4 py-2 rounded-xl font-semibold transition ${
                        currentPage === page
                            ? "bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-lg"
                            : "bg-white dark:bg-white-800 border-2 border-white-200 dark:border-white-700 hover:border-green-500"
                    }`}
                >
                    {page}
                </motion.button>
            ))}

            {endPage < lastPage && (
                <>
                    {endPage < lastPage - 1 && (
                        <span className="text-gray-500">...</span>
                    )}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        onClick={() => onPageChange(lastPage)}
                        className="px-4 py-2 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl font-semibold hover:border-green-500 transition"
                    >
                        {lastPage}
                    </motion.button>
                </>
            )}

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === lastPage}
                className="px-4 py-2 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:border-green-500 transition"
            >
                {lang === "ar" ? (
                    <ChevronLeftIcon size={20} />
                ) : (
                    <ChevronRightIcon size={20} />
                )}
            </motion.button>
        </div>
    );
}
