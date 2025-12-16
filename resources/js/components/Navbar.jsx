import { Link } from "@inertiajs/react";
import { useLang } from "@/context/LangContext";
import {
    Menu,
    X,
    Home,
    Lightbulb,
    ChefHat,
    HeartPulse,
    Calendar,
    Baby,
    BookOpen,
    Globe,
    Pizza,
    Salad,
    Cookie,
    UtensilsCrossed,
    IceCream,
    Beef as BeefIcon,
    ChevronDown,
    Star,
    ArrowRight,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

export default function Navbar() {
    const { lang, changeLang, t } = useLang();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [categoriesOpen, setCategoriesOpen] = useState(false);

    const categoriesRef = useRef(null);

    const currentPath =
        typeof window !== "undefined" ? window.location.pathname : "/";

    const isActive = (path) => {
        if (path === "/") return currentPath === "/";
        return currentPath.startsWith(path);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                categoriesRef.current &&
                !categoriesRef.current.contains(event.target)
            ) {
                setCategoriesOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const categories = [
        {
            icon: Pizza,
            nameAr: "باستا",
            nameEn: "Pasta",
            color: "bg-red-500",
            emoji: "🍝",
        },
        {
            icon: Salad,
            nameAr: "نباتي",
            nameEn: "Vegetarian",
            color: "bg-green-500",
            emoji: "🥗",
        },
        {
            icon: Cookie,
            nameAr: "حلويات",
            nameEn: "Desserts",
            color: "bg-pink-500",
            emoji: "🍰",
        },
        {
            icon: BeefIcon,
            nameAr: "لحم بقر",
            nameEn: "Beef",
            color: "bg-red-600",
            emoji: "🥩",
        },
        {
            icon: UtensilsCrossed,
            nameAr: "دجاج",
            nameEn: "Chicken",
            color: "bg-amber-500",
            emoji: "🍗",
        },
        {
            icon: IceCream,
            nameAr: "فطور",
            nameEn: "Breakfast",
            color: "bg-blue-500",
            emoji: "🥞",
        },
    ];

    const navLinks = [
        {
            path: "/",
            icon: Home,
            labelAr: "الرئيسية",
            labelEn: "Home",
            color: "bg-orange-500",
        },
        {
            path: "/what-to-cook",
            icon: Lightbulb,
            labelAr: "شو اطبخ؟",
            labelEn: "What to Cook?",
            color: "bg-yellow-500",
        },
        {
            path: "/medical-recipes",
            icon: HeartPulse,
            labelAr: "وصفات صحية",
            labelEn: "Healthy",
            color: "bg-rose-500",
        },
        {
            path: "/meal-planner",
            icon: Calendar,
            labelAr: "مخطط الوجبات",
            labelEn: "Planner",
            color: "bg-purple-500",
        },
        {
            path: "/kids-meals",
            icon: Baby,
            labelAr: "وجبات الأطفال",
            labelEn: "Kids",
            color: "bg-cyan-500",
        },
        {
            path: "/Magazine",
            icon: BookOpen,
            labelAr: "مجلة جود",
            labelEn: "Magazine",
            color: "bg-teal-500",
        },
    ];

    const handleLanguageToggle = () => {
        changeLang(lang === "ar" ? "en" : "ar");
    };

    return (
        <>
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl border-b-2 border-orange-200 dark:border-gray-800 shadow-xl">
                <nav className="max-w-[1400px] mx-auto px-3 sm:px-4 md:px-6">
                    <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
                        {/* Logo */}
                        <Link href="/" className="flex-shrink-0 group">
                            <img
                                src="/images/joodw.png"
                                alt="JOOD"
                                className="w-20 sm:w-24 md:w-28 lg:w-32 h-auto object-contain dark:brightness-0 dark:invert transition-transform group-hover:scale-105"
                                onError={(e) =>
                                    (e.target.src = "/images/logo.png")
                                }
                            />
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden lg:flex items-center flex-1 justify-center">
                            <div className="flex items-center gap-1">
                                {navLinks.map((link, index) => {
                                    const Icon = link.icon;
                                    const active = isActive(link.path);
                                    return (
                                        <div
                                            key={link.path}
                                            className="flex items-center"
                                        >
                                            <Link
                                                href={link.path}
                                                className="relative group"
                                            >
                                                <div
                                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg font-semibold text-sm transition-all ${
                                                        active
                                                            ? `${link.color} text-white shadow-md`
                                                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                                                    }`}
                                                >
                                                    <Icon size={16} />
                                                    <span className="whitespace-nowrap">
                                                        {lang === "ar"
                                                            ? link.labelAr
                                                            : link.labelEn}
                                                    </span>
                                                </div>
                                                {active && (
                                                    <div
                                                        className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3/4 h-0.5 ${link.color} rounded-full`}
                                                    ></div>
                                                )}
                                            </Link>
                                            {index < navLinks.length - 1 && (
                                                <div className="mx-1 h-5 w-px bg-gray-300 dark:bg-gray-700"></div>
                                            )}
                                        </div>
                                    );
                                })}

                                {/* Separator before Categories */}
                                <div className="mx-1 h-5 w-px bg-gray-300 dark:bg-gray-700"></div>

                                {/* Categories Dropdown */}
                                <div className="relative" ref={categoriesRef}>
                                    <button
                                        onClick={() =>
                                            setCategoriesOpen(!categoriesOpen)
                                        }
                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg font-semibold text-sm transition-all ${
                                            categoriesOpen
                                                ? "bg-violet-500 text-white shadow-md"
                                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                                        }`}
                                    >
                                        <ChefHat size={16} />
                                        <span>{t("الفئات", "Categories")}</span>
                                        <ChevronDown
                                            size={14}
                                            className={
                                                categoriesOpen
                                                    ? "rotate-180 transition-transform"
                                                    : "transition-transform"
                                            }
                                        />
                                    </button>

                                    {categoriesOpen && (
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-96 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border-2 border-gray-200 dark:border-gray-800 overflow-hidden">
                                            {/* Header */}
                                            <div className="bg-gradient-to-r from-violet-600 to-purple-600 px-5 py-3">
                                                <div className="flex items-center gap-2 text-white">
                                                    <ChefHat size={18} />
                                                    <h3 className="text-base font-black">
                                                        {t(
                                                            "الفئات",
                                                            "Categories"
                                                        )}
                                                    </h3>
                                                </div>
                                            </div>

                                            {/* All Recipes */}
                                            <div className="p-3 border-b border-gray-200 dark:border-gray-800">
                                                <Link
                                                    href="/recipes"
                                                    onClick={() =>
                                                        setCategoriesOpen(false)
                                                    }
                                                    className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-gray-800 rounded-xl hover:shadow-md transition-all group"
                                                >
                                                    <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg">
                                                        <Star
                                                            size={18}
                                                            className="text-white"
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                                                            {t(
                                                                "كل الوصفات",
                                                                "All Recipes"
                                                            )}
                                                        </h4>
                                                    </div>
                                                    <ArrowRight
                                                        size={16}
                                                        className="text-gray-400 group-hover:translate-x-1 transition-transform"
                                                    />
                                                </Link>
                                            </div>

                                            {/* Categories Grid */}
                                            <div className="p-3 grid grid-cols-2 gap-2">
                                                {categories.map((cat, idx) => {
                                                    const Icon = cat.icon;
                                                    return (
                                                        <Link
                                                            key={idx}
                                                            href={`/recipes?category=${encodeURIComponent(
                                                                cat.nameEn
                                                            )}`}
                                                            onClick={() =>
                                                                setCategoriesOpen(
                                                                    false
                                                                )
                                                            }
                                                            className="flex items-center gap-2 p-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl hover:shadow-md hover:-translate-y-0.5 transition-all"
                                                        >
                                                            <div
                                                                className={`p-1.5 ${cat.color} rounded-lg`}
                                                            >
                                                                <Icon
                                                                    size={14}
                                                                    className="text-white"
                                                                />
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <span className="text-base">
                                                                    {cat.emoji}
                                                                </span>
                                                                <span className="font-bold text-xs text-gray-900 dark:text-white">
                                                                    {lang ===
                                                                    "ar"
                                                                        ? cat.nameAr
                                                                        : cat.nameEn}
                                                                </span>
                                                            </div>
                                                        </Link>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Section */}
                        <div className="flex items-center gap-2 sm:gap-3">
                            {/* Language Toggle Button - Desktop */}
                            <button
                                onClick={handleLanguageToggle}
                                className="hidden lg:flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gradient-to-r hover:from-orange-500 hover:to-amber-500 border-2 border-gray-300 dark:border-gray-600 hover:border-orange-400 rounded-lg transition-all font-semibold text-sm shadow-md hover:shadow-lg group"
                            >
                                <Globe
                                    size={16}
                                    className="text-gray-700 dark:text-gray-300 group-hover:text-white transition-colors"
                                />
                                <span className="text-lg">
                                    {lang === "ar" ? "🇸🇦" : "🇺🇸"}
                                </span>
                                <span className="text-gray-800 dark:text-gray-200 group-hover:text-white transition-colors">
                                    {lang === "ar" ? "ع" : "EN"}
                                </span>
                            </button>

                            {/* Mobile Menu Button */}
                            <button
                                onClick={() => setMobileOpen(!mobileOpen)}
                                className="lg:hidden p-2 sm:p-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg shadow-lg active:scale-95 transition-transform"
                            >
                                {mobileOpen ? (
                                    <X size={20} className="sm:w-5 sm:h-5" />
                                ) : (
                                    <Menu size={20} className="sm:w-5 sm:h-5" />
                                )}
                            </button>
                        </div>
                    </div>
                </nav>
            </header>

            {/* Mobile Menu */}
            {mobileOpen && (
                <div className="lg:hidden fixed inset-0 z-40 bg-white dark:bg-gray-950">
                    <div className="h-full overflow-y-auto pt-20 sm:pt-24 pb-6 px-4 sm:px-6">
                        {/* Nav Links */}
                        <div className="space-y-2 mb-6">
                            {navLinks.map((link) => {
                                const Icon = link.icon;
                                const active = isActive(link.path);
                                return (
                                    <Link
                                        key={link.path}
                                        href={link.path}
                                        onClick={() => setMobileOpen(false)}
                                        className={`flex items-center gap-3 p-3 sm:p-3.5 rounded-xl font-bold text-sm transition-all active:scale-95 ${
                                            active
                                                ? `${link.color} text-white shadow-lg`
                                                : "text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800"
                                        }`}
                                    >
                                        <Icon
                                            size={18}
                                            className="flex-shrink-0"
                                        />
                                        <span>
                                            {lang === "ar"
                                                ? link.labelAr
                                                : link.labelEn}
                                        </span>
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Categories */}
                        <div className="mb-6">
                            <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-3 px-2">
                                {t("الفئات", "CATEGORIES")}
                            </h3>
                            <Link
                                href="/recipes"
                                onClick={() => setMobileOpen(false)}
                                className="flex items-center gap-3 p-3 sm:p-3.5 mb-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-bold text-sm shadow-lg active:scale-95 transition-transform"
                            >
                                <Star size={18} className="flex-shrink-0" />
                                <span>{t("كل الوصفات", "All Recipes")}</span>
                            </Link>
                            <div className="grid grid-cols-2 gap-2">
                                {categories.map((cat, idx) => {
                                    const Icon = cat.icon;
                                    return (
                                        <Link
                                            key={idx}
                                            href={`/recipes?category=${encodeURIComponent(
                                                cat.nameEn
                                            )}`}
                                            onClick={() => setMobileOpen(false)}
                                            className="flex flex-col items-center gap-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-xl active:scale-95 transition-transform"
                                        >
                                            <div
                                                className={`p-2 ${cat.color} rounded-lg`}
                                            >
                                                <Icon
                                                    size={16}
                                                    className="text-white"
                                                />
                                            </div>
                                            <span className="text-xs font-bold text-gray-900 dark:text-white text-center">
                                                {lang === "ar"
                                                    ? cat.nameAr
                                                    : cat.nameEn}
                                            </span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Language Toggle - Mobile */}
                        <div>
                            <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-3 px-2">
                                {t("اللغة", "LANGUAGE")}
                            </h3>
                            <button
                                onClick={() => {
                                    handleLanguageToggle();
                                    setMobileOpen(false);
                                }}
                                className="w-full flex items-center justify-between gap-3 p-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-bold shadow-lg active:scale-95 transition-transform"
                            >
                                <div className="flex items-center gap-3">
                                    <Globe size={20} />
                                    <span className="text-2xl">
                                        {lang === "ar" ? "🇸🇦" : "🇺🇸"}
                                    </span>
                                    <span>
                                        {lang === "ar" ? "العربية" : "English"}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1 bg-white/20 rounded-lg">
                                    <span className="text-sm font-black">
                                        {lang === "ar" ? "ع" : "EN"}
                                    </span>
                                    <ArrowRight size={16} />
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
