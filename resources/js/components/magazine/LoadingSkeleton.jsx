import React from "react";

export default function LoadingSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                    key={i}
                    className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden animate-pulse"
                >
                    <div className="h-64 bg-gray-300 dark:bg-gray-700"></div>
                    <div className="p-5 space-y-3">
                        <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded"></div>
                        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                        <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded mt-4"></div>
                    </div>
                </div>
            ))}
        </div>
    );
}
