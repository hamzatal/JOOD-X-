import React from "react";

export default function LoadingSkeleton({ count = 5, columns = 5 }) {
    const gridCols = {
        3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
        4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
        5: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
    };

    return (
        <div className={`grid ${gridCols[columns]} gap-4 md:gap-6`}>
            {Array.from({ length: count }).map((_, idx) => (
                <div
                    key={idx}
                    className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg animate-pulse"
                >
                    <div className="h-40 bg-gray-300 dark:bg-gray-700" />
                    <div className="p-3 space-y-2">
                        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4" />
                        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-full" />
                        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-5/6" />
                        <div className="flex gap-2">
                            <div className="h-5 w-12 bg-gray-300 dark:bg-gray-700 rounded-full" />
                            <div className="h-5 w-12 bg-gray-300 dark:bg-gray-700 rounded-full" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
