import React, { useState } from "react";
import { motion } from "framer-motion";
import {
    Menu,
    X,
    ChefHat,
    Home,
    BookOpen,
    Calendar,
    ShoppingCart,
    User,
} from "lucide-react";

export default function Navbar({ lang = "ar", onChangeLang }) {
    const [isOpen, setIsOpen] = useState(false);
    const isRTL = lang === "ar";
    const t = (ar, en) => (lang === "ar" ? ar : en);

    const menuItems = [
        { icon: Home, label: t("الرئيسية", "Home"), href: "/" },
        { icon: BookOpen, label: t("الوصفات", "Recipes"), href: "/recipes" },
        {
            icon: Calendar,
            label: t("خطة الوجبات", "Meal Plan"),
            href: "/meal-plan",
        },
        {
            icon: ShoppingCart,
            label: t("قائمة التسوق", "Shopping"),
            href: "/shopping",
        },
    ];

    return (
        <nav className="sticky top-0 z-50 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 backdrop-blur-xl border-b border-gray-700/50 shadow-xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="flex items-center gap-3"
                    >
                        <div className="p-2 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl">
                            <ChefHat size={28} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                                {t("مكتبة الوصفات", "Recipe Library")}
                            </h1>
                            <p className="text-xs text-gray-400">
                                {t("وصفات لذيذة وصحية", "Delicious & Healthy")}
                            </p>
                        </div>
                    </motion.div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-2">
                        {menuItems.map((item, idx) => (
                            <motion.a
                                key={idx}
                                href={item.href}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-gray-300 hover:text-white hover:bg-gray-700/50 transition-all"
                            >
                                <item.icon size={18} />
                                {item.label}
                            </motion.a>
                        ))}

                        {/* Language Toggle */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() =>
                                onChangeLang?.(lang === "ar" ? "en" : "ar")
                            }
                            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-semibold ml-2"
                        >
                            {lang === "ar" ? "EN" : "عربي"}
                        </motion.button>

                        {/* User Button */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="p-2 bg-gray-700/50 rounded-xl"
                        >
                            <User size={20} className="text-gray-300" />
                        </motion.button>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="md:hidden p-2 rounded-xl bg-gray-700/50 text-gray-300"
                    >
                        {isOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="md:hidden py-4 space-y-2"
                    >
                        {menuItems.map((item, idx) => (
                            <a
                                key={idx}
                                href={item.href}
                                className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:bg-gray-700/50 transition-all"
                            >
                                <item.icon size={18} />
                                {item.label}
                            </a>
                        ))}
                        <button
                            onClick={() =>
                                onChangeLang?.(lang === "ar" ? "en" : "ar")
                            }
                            className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-semibold"
                        >
                            {lang === "ar" ? "English" : "العربية"}
                        </button>
                    </motion.div>
                )}
            </div>
        </nav>
    );
}
