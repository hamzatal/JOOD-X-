import { Link } from "@inertiajs/react";
import { useLang } from "@/context/LangContext";
import {
    Menu,
    X,
    LogIn,
    User,
    ChefHat,
    Flame,
    Lightbulb,
    Home,
} from "lucide-react";
import { useState } from "react";

export default function Navbar({ isLoggedIn = false, isAdmin = false }) {
    const { lang, changeLang, t } = useLang();
    const [open, setOpen] = useState(false);

    return (
        <header className="w-full sticky top-0 z-50 backdrop-blur-xl bg-gray-900/70 border-b border-gray-700/40">
            <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
                {/* LOGO */}
                <Link href="/" className="flex items-center">
                    <img
                        src="/images/joodw.png"
                        alt="JOOD"
                        className="w-28 h-auto object-contain hover:scale-105 transition"
                        onError={(e) => (e.target.src = "/images/logo.png")}
                    />
                </Link>

                {/* Desktop menu */}
                <div className="hidden md:flex items-center gap-8 text-gray-200">
                    <Link
                        href="/"
                        className="flex items-center gap-2 hover:text-green-400"
                    >
                        <Home size={18} /> {t("navbar.home")}
                    </Link>

                    <Link
                        href="/recipes"
                        className="flex items-center gap-2 hover:text-green-400"
                    >
                        <ChefHat size={18} /> {t("navbar.recipes")}
                    </Link>

                    <Link
                        href="/what-to-cook"
                        className="flex items-center gap-2 hover:text-green-400"
                    >
                        <Lightbulb size={18} /> {t("navbar.whatCook")}
                    </Link>

                    <Link
                        href="/trending"
                        className="flex items-center gap-2 hover:text-green-400"
                    >
                        <Flame size={18} /> {t("navbar.trending")}
                    </Link>

                    <Link
                        href="/stores"
                        className="flex items-center gap-2 hover:text-green-400"
                    >
                        🛒 {t("navbar.stores")}
                    </Link>

                    <button
                        onClick={() => changeLang(lang === "ar" ? "en" : "ar")}
                        className="px-4 py-1 bg-gray-800 text-gray-200 rounded-full hover:bg-gray-700 transition font-medium"
                    >
                        {lang === "ar" ? "English" : "عربي"}
                    </button>
                </div>

                {/* Auth btns */}
                <div className="hidden md:flex items-center gap-4">
                    {!isLoggedIn && !isAdmin ? (
                        <Link
                            href="/login"
                            className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                        >
                            <LogIn size={18} /> {t("navbar.login")}
                        </Link>
                    ) : isAdmin ? (
                        <Link
                            href="/admin"
                            className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                        >
                            <User size={18} /> {t("navbar.admin")}
                        </Link>
                    ) : (
                        <Link
                            href="/dashboard"
                            className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                        >
                            <User size={18} /> {t("navbar.dashboard")}
                        </Link>
                    )}
                </div>

                {/* Mobile menu toggle */}
                <button
                    className="md:hidden text-white"
                    onClick={() => setOpen(!open)}
                >
                    {open ? <X size={26} /> : <Menu size={26} />}
                </button>
            </nav>

            {/* Mobile menu */}
            {open && (
                <div className="md:hidden px-6 py-6 bg-black/60 backdrop-blur-xl border-t border-gray-700">
                    <div className="flex flex-col gap-4 text-gray-200">
                        <Link href="/" className="flex items-center gap-2">
                            <Home size={18} /> {t("navbar.home")}
                        </Link>

                        <Link
                            href="/recipes"
                            className="flex items-center gap-2"
                        >
                            <ChefHat size={18} /> {t("navbar.recipes")}
                        </Link>

                        <Link
                            href="/what-to-cook"
                            className="flex items-center gap-2"
                        >
                            <Lightbulb size={18} /> {t("navbar.whatCook")}
                        </Link>

                        <Link
                            href="/trending"
                            className="flex items-center gap-2"
                        >
                            <Flame size={18} /> {t("navbar.trending")}
                        </Link>

                        <Link
                            href="/stores"
                            className="flex items-center gap-2"
                        >
                            🛒 {t("navbar.stores")}
                        </Link>

                        <button
                            onClick={() =>
                                changeLang(lang === "ar" ? "en" : "ar")
                            }
                            className="mt-2 px-4 py-2 bg-gray-800 rounded-lg text-gray-200"
                        >
                            {lang === "ar" ? "English" : "عربي"}
                        </button>

                        {!isLoggedIn && !isAdmin ? (
                            <Link
                                href="/login"
                                className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2"
                            >
                                <LogIn size={18} /> {t("navbar.login")}
                            </Link>
                        ) : isAdmin ? (
                            <Link
                                href="/admin"
                                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg flex items-center gap-2"
                            >
                                <User size={18} /> {t("navbar.admin")}
                            </Link>
                        ) : (
                            <Link
                                href="/dashboard"
                                className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2"
                            >
                                <User size={18} /> {t("navbar.dashboard")}
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
