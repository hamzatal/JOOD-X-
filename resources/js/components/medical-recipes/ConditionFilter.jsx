import React from "react";
import { motion } from "framer-motion";

export default function ConditionFilter({
    conditions,
    selected,
    onSelect,
    lang,
}) {
    return (
        <div className="flex flex-wrap gap-2">
            {conditions.map((condition) => (
                <motion.button
                    key={condition.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onSelect(condition.id)}
                    className={`px-4 py-2 rounded-xl font-semibold transition-all flex items-center gap-2 text-sm ${
                        selected === condition.id
                            ? "bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-lg"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                >
                    <span className="text-lg">{condition.icon}</span>
                    <span>{condition.name}</span>
                </motion.button>
            ))}
        </div>
    );
}
