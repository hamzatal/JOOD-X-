import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    XIcon,
    ClockIcon,
    UsersIcon,
    FlameIcon,
    PrinterIcon,
    CheckCircleIcon,
    ChefHatIcon,
    ListChecksIcon,
    HeartPulseIcon,
} from "lucide-react";

export default function RecipeModal({ recipe, isOpen, onClose, lang }) {
    const [activeTab, setActiveTab] = useState("ingredients");

    if (!recipe) return null;

    const ingredients = Array.isArray(recipe.ingredients)
        ? recipe.ingredients
        : [];

    const processedIngredients = ingredients.map((item, idx) => {
        if (typeof item === "string") {
            return { ingredient: item, measure: "", index: idx };
        }
        return {
            ingredient: item.ingredient || item.item || item.name || "مكون",
            measure: item.measure || item.amount || "",
            index: idx,
        };
    });

    const instructionSteps = recipe.instructions
        ? recipe.instructions.split(/\n+/).filter((s) => s.trim())
        : [];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
                    />

                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 30 }}
                            transition={{
                                type: "spring",
                                damping: 25,
                                stiffness: 300,
                            }}
                            className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
                        >
                            <div className="absolute top-4 right-4 z-10 flex gap-2">
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => window.print()}
                                    className="p-2.5 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all shadow-lg"
                                >
                                    <PrinterIcon
                                        size={18}
                                        className="text-gray-700 dark:text-gray-300"
                                    />
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={onClose}
                                    className="p-2.5 bg-red-500 hover:bg-red-600 rounded-xl transition-all shadow-lg"
                                >
                                    <XIcon size={18} className="text-white" />
                                </motion.button>
                            </div>

                            <div className="flex flex-col lg:flex-row h-full max-h-[90vh]">
                                {/* Left Side */}
                                <div className="lg:w-2/5 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-900 p-6 flex flex-col">
                                    {/* Recipe Image */}
                                    <motion.div
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: 0.1 }}
                                        className="relative rounded-3xl overflow-hidden shadow-2xl mb-4"
                                    >
                                        <img
                                            src={recipe.image}
                                            alt={recipe.title}
                                            className="w-full h-64 lg:h-72 object-cover"
                                            onError={(e) => {
                                                e.target.src =
                                                    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=800&fit=crop";
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                                    </motion.div>

                                    {/* Title */}
                                    <motion.h1
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.2 }}
                                        className="text-2xl font-bold text-gray-900 dark:text-white mb-2"
                                    >
                                        {recipe.title}
                                    </motion.h1>

                                    {/* Description */}
                                    {recipe.desc && (
                                        <motion.p
                                            initial={{ y: 20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ delay: 0.3 }}
                                            className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed text-sm"
                                        >
                                            {recipe.desc}
                                        </motion.p>
                                    )}

                                    {/* Quick Info */}
                                    <motion.div
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.4 }}
                                        className="flex gap-2 mb-3"
                                    >
                                        <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl p-3 shadow-md text-center">
                                            <ClockIcon
                                                size={16}
                                                className="text-green-600 mx-auto mb-1"
                                            />
                                            <div className="text-base font-bold text-gray-900 dark:text-white">
                                                {recipe.time}
                                            </div>
                                            <div className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-semibold">
                                                {lang === "ar" ? "وقت" : "Time"}
                                            </div>
                                        </div>

                                        <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl p-3 shadow-md text-center">
                                            <UsersIcon
                                                size={16}
                                                className="text-blue-600 mx-auto mb-1"
                                            />
                                            <div className="text-base font-bold text-gray-900 dark:text-white">
                                                {recipe.servings}
                                            </div>
                                            <div className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-semibold">
                                                {lang === "ar"
                                                    ? "حصص"
                                                    : "Servings"}
                                            </div>
                                        </div>
                                    </motion.div>

                                    {/* Nutrition - Row */}
                                    <motion.div
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.5 }}
                                        className="flex gap-2 mb-4"
                                    >
                                        <div className="flex-1 bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-2 text-center shadow-md">
                                            <FlameIcon
                                                size={12}
                                                className="text-white mx-auto mb-0.5"
                                            />
                                            <div className="text-sm font-bold text-white">
                                                {recipe.calories}
                                            </div>
                                            <div className="text-[9px] text-red-100 font-semibold uppercase leading-tight">
                                                {lang === "ar" ? "سعرة" : "Cal"}
                                            </div>
                                        </div>

                                        <div className="flex-1 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-2 text-center shadow-md">
                                            <div className="text-sm font-bold text-white mt-3">
                                                {recipe.protein}
                                            </div>
                                            <div className="text-[9px] text-blue-100 font-semibold uppercase leading-tight">
                                                {lang === "ar"
                                                    ? "بروتين"
                                                    : "Protein"}
                                            </div>
                                        </div>

                                        <div className="flex-1 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-2 text-center shadow-md">
                                            <div className="text-sm font-bold text-white mt-3">
                                                {recipe.carbs}
                                            </div>
                                            <div className="text-[9px] text-amber-100 font-semibold uppercase leading-tight">
                                                {lang === "ar"
                                                    ? "كربو"
                                                    : "Carbs"}
                                            </div>
                                        </div>

                                        <div className="flex-1 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-2 text-center shadow-md">
                                            <div className="text-sm font-bold text-white mt-3">
                                                {recipe.fat}
                                            </div>
                                            <div className="text-[9px] text-orange-100 font-semibold uppercase leading-tight">
                                                {lang === "ar" ? "دهون" : "Fat"}
                                            </div>
                                        </div>
                                    </motion.div>

                                    {/* Benefits */}
                                    {recipe.benefits && (
                                        <motion.div
                                            initial={{ y: 20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ delay: 0.6 }}
                                            className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-md border-2 border-green-500 flex-1"
                                        >
                                            <div className="flex items-start gap-2">
                                                <HeartPulseIcon
                                                    size={16}
                                                    className="text-green-600 flex-shrink-0 mt-0.5"
                                                />
                                                <div>
                                                    <h4 className="font-bold text-green-900 dark:text-green-200 mb-1 text-xs">
                                                        {lang === "ar"
                                                            ? "الفوائد الطبية"
                                                            : "Medical Benefits"}
                                                    </h4>
                                                    <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed">
                                                        {recipe.benefits}
                                                    </p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>

                                {/* Right Side */}
                                <div className="lg:w-3/5 flex flex-col">
                                    {/* Tabs */}
                                    <div className="flex gap-2 p-3 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                                        <button
                                            onClick={() =>
                                                setActiveTab("ingredients")
                                            }
                                            className={`flex-1 px-4 py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-sm ${
                                                activeTab === "ingredients"
                                                    ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg"
                                                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                                            }`}
                                        >
                                            <ListChecksIcon size={18} />
                                            {lang === "ar"
                                                ? "المكونات"
                                                : "Ingredients"}
                                            {processedIngredients.length >
                                                0 && (
                                                <span
                                                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                                                        activeTab ===
                                                        "ingredients"
                                                            ? "bg-white/30"
                                                            : "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                                                    }`}
                                                >
                                                    {
                                                        processedIngredients.length
                                                    }
                                                </span>
                                            )}
                                        </button>
                                        <button
                                            onClick={() =>
                                                setActiveTab("instructions")
                                            }
                                            className={`flex-1 px-4 py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-sm ${
                                                activeTab === "instructions"
                                                    ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg"
                                                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                                            }`}
                                        >
                                            <ChefHatIcon size={18} />
                                            {lang === "ar"
                                                ? "طريقة التحضير"
                                                : "Instructions"}
                                        </button>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-white dark:bg-gray-900">
                                        <AnimatePresence mode="wait">
                                            {activeTab === "ingredients" && (
                                                <motion.div
                                                    key="ingredients"
                                                    initial={{
                                                        opacity: 0,
                                                        x: -20,
                                                    }}
                                                    animate={{
                                                        opacity: 1,
                                                        x: 0,
                                                    }}
                                                    exit={{ opacity: 0, x: 20 }}
                                                    transition={{
                                                        duration: 0.3,
                                                    }}
                                                    className="space-y-3"
                                                >
                                                    {processedIngredients.length >
                                                    0 ? (
                                                        processedIngredients.map(
                                                            (item) => (
                                                                <motion.div
                                                                    key={
                                                                        item.index
                                                                    }
                                                                    initial={{
                                                                        opacity: 0,
                                                                        x: -20,
                                                                    }}
                                                                    animate={{
                                                                        opacity: 1,
                                                                        x: 0,
                                                                    }}
                                                                    transition={{
                                                                        delay:
                                                                            item.index *
                                                                            0.05,
                                                                    }}
                                                                    whileHover={{
                                                                        scale: 1.02,
                                                                        x: 5,
                                                                    }}
                                                                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl hover:shadow-md transition-all group"
                                                                >
                                                                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-lg flex items-center justify-center text-sm font-bold shadow-md flex-shrink-0 group-hover:scale-110 transition-transform">
                                                                        {item.index +
                                                                            1}
                                                                    </div>

                                                                    <div className="flex-1 flex items-center gap-2 flex-wrap">
                                                                        {item.measure && (
                                                                            <span className="px-2.5 py-1 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 rounded-lg font-bold text-xs">
                                                                                {
                                                                                    item.measure
                                                                                }
                                                                            </span>
                                                                        )}
                                                                        <span className="text-gray-900 dark:text-white font-medium text-sm">
                                                                            {
                                                                                item.ingredient
                                                                            }
                                                                        </span>
                                                                    </div>

                                                                    <CheckCircleIcon
                                                                        size={
                                                                            18
                                                                        }
                                                                        className="text-gray-300 dark:text-gray-600 group-hover:text-green-500 transition-colors flex-shrink-0"
                                                                    />
                                                                </motion.div>
                                                            )
                                                        )
                                                    ) : (
                                                        <div className="text-center py-20 text-gray-400">
                                                            <ListChecksIcon
                                                                size={64}
                                                                className="mx-auto mb-4 opacity-20"
                                                            />
                                                            <p className="font-semibold text-lg">
                                                                {lang === "ar"
                                                                    ? "لا توجد مكونات"
                                                                    : "No ingredients"}
                                                            </p>
                                                        </div>
                                                    )}
                                                </motion.div>
                                            )}

                                            {activeTab === "instructions" && (
                                                <motion.div
                                                    key="instructions"
                                                    initial={{
                                                        opacity: 0,
                                                        x: -20,
                                                    }}
                                                    animate={{
                                                        opacity: 1,
                                                        x: 0,
                                                    }}
                                                    exit={{ opacity: 0, x: 20 }}
                                                    transition={{
                                                        duration: 0.3,
                                                    }}
                                                    className="space-y-4"
                                                >
                                                    {instructionSteps.length >
                                                    0 ? (
                                                        instructionSteps.map(
                                                            (step, idx) => (
                                                                <motion.div
                                                                    key={idx}
                                                                    initial={{
                                                                        opacity: 0,
                                                                        x: -20,
                                                                    }}
                                                                    animate={{
                                                                        opacity: 1,
                                                                        x: 0,
                                                                    }}
                                                                    transition={{
                                                                        delay:
                                                                            idx *
                                                                            0.1,
                                                                    }}
                                                                    className="flex gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:shadow-md transition-all"
                                                                >
                                                                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-md">
                                                                        {idx +
                                                                            1}
                                                                    </div>
                                                                    <p className="flex-1 text-gray-700 dark:text-gray-300 leading-relaxed text-sm pt-0.5">
                                                                        {step}
                                                                    </p>
                                                                </motion.div>
                                                            )
                                                        )
                                                    ) : (
                                                        <div className="text-center py-20 text-gray-400">
                                                            <ChefHatIcon
                                                                size={64}
                                                                className="mx-auto mb-4 opacity-20"
                                                            />
                                                            <p className="font-semibold text-lg">
                                                                {lang === "ar"
                                                                    ? "لا توجد تعليمات"
                                                                    : "No instructions"}
                                                            </p>
                                                        </div>
                                                    )}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    <style jsx>{`
                        .custom-scrollbar::-webkit-scrollbar {
                            width: 8px;
                        }

                        .custom-scrollbar::-webkit-scrollbar-track {
                            background: #f3f4f6;
                            border-radius: 10px;
                        }

                        .dark .custom-scrollbar::-webkit-scrollbar-track {
                            background: #1f2937;
                        }

                        .custom-scrollbar::-webkit-scrollbar-thumb {
                            background: linear-gradient(
                                180deg,
                                #10b981,
                                #059669
                            );
                            border-radius: 10px;
                        }

                        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                            background: linear-gradient(
                                180deg,
                                #059669,
                                #047857
                            );
                        }
                    `}</style>
                </>
            )}
        </AnimatePresence>
    );
}
