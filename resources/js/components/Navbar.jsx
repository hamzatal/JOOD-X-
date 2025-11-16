import { Link } from "@inertiajs/react";
import {
    LogIn,
    User,
    BookOpen,
    Lightbulb,
    ShoppingCart,
    Globe,
} from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Navbar({ isLoggedIn = false, isAdmin = false }) {
    const { t, i18n } = useTranslation();

    const changeLanguage = () => {
        const newLng = i18n.language === "ar" ? "en" : "ar";
        sessionStorage.setItem("locale", newLng);
        window.location.reload();
    };

    return (
        <header className="w-full flex justify-between items-center px-6 md:px-12 py-4 bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50 backdrop-blur-lg bg-white/95 dark:bg-gray-800/95">
            {/* Logo */}
            <Link href="/" className="flex items-center">
                <img
                    src="/images/joodw.png"
                    alt="JOOD"
                    className="w-25 h-10 md:w-26 md:h-9 object-contain"
                    onError={(e) => (e.target.src = "/images/logo.png")}
                />
            </Link>

            {/* Middle Navigation */}
            <nav className="hidden md:flex items-center gap-8">
                <Link
                    href="#recipes"
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-green-600 transition-colors font-medium"
                >
                    <BookOpen size={18} /> {t("navbar.recipes")}
                </Link>
                <Link
                    href="#ai"
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-green-600 transition-colors font-medium"
                >
                    <Lightbulb size={18} /> {t("navbar.aiAssistant")}
                </Link>
                <Link
                    href="#stores"
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-green-600 transition-colors font-medium"
                >
                    <ShoppingCart size={18} /> {t("navbar.stores")}
                </Link>
            </nav>
            <div className="flex items-center gap-4">
                {/* Language Toggle */}
                <button
                    onClick={changeLanguage}
                    className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:scale-110 transition-transform"
                >
                    <Globe size={18} className="text-green-600" />
                </button>

                {/* Auth */}
                {!isLoggedIn && !isAdmin ? (
                    <Link
                        href="/login"
                        className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg flex items-center gap-2 shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300"
                    >
                        <LogIn size={18} />
                        {t("navbar.signIn")} / {t("navbar.signUp")}
                    </Link>
                ) : isAdmin ? (
                    <Link
                        href="/admin"
                        className="px-4 py-2 bg-red-600 text-white rounded-lg flex items-center gap-2 shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300"
                    >
                        <User size={18} /> {t("navbar.admin")}
                    </Link>
                ) : (
                    <Link
                        href="/dashboard"
                        className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg flex items-center gap-2 shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300"
                    >
                        <User size={18} /> {t("navbar.dashboard")}
                    </Link>
                )}
            </div>
        </header>
    );
}
