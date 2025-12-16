import { Link } from "@inertiajs/react";
import { useLang } from "@/context/LangContext";
import {
    Menu,
    X,
    LogIn,
    User,
    ChefHat,
    Lightbulb,
    Home,
    HeartPulseIcon,
    BookOpen,
    ChevronDown,
    Pizza,
    Salad,
    Cookie,
    UtensilsCrossed,
    IceCream,
    Grid,
    Beef as BeefIcon,
    ListCheckIcon,
    BabyIcon,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

export default function Navbar({ isLoggedIn = false, isAdmin = false }) {
    const { lang, changeLang, t } = useLang();
    const [open, setOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const timeoutRef = useRef(null);

    const currentPath =
        typeof window !== "undefined" ? window.location.pathname : "/";

    const isActive = (path) => {
        if (path === "/") return currentPath === "/";
        return currentPath.startsWith(path);
    };

    const activeClass =
        "text-green-400 font-semibold border-b-2 border-green-400";
    const inactiveClass = "text-gray-200 hover:text-green-400";

    const categories = [
        {
            icon: Pizza,
            nameAr: "باستا",
            nameEn: "Pasta",
            color: "from-red-500 to-orange-500",
        },
        {
            icon: Salad,
            nameAr: "نباتي",
            nameEn: "Vegetarian",
            color: "from-green-500 to-emerald-500",
        },
        {
            icon: Cookie,
            nameAr: "حلويات",
            nameEn: "Desserts",
            color: "from-pink-500 to-purple-500",
        },
        {
            icon: BeefIcon,
            nameAr: "لحم بقر",
            nameEn: "Beef",
            color: "from-blue-500 to-cyan-500",
        },
        {
            icon: UtensilsCrossed,
            nameAr: "دجاج",
            nameEn: "Chicken",
            color: "from-amber-500 to-yellow-500",
        },
        {
            icon: IceCream,
            nameAr: "فطور",
            nameEn: "Breakfast",
            color: "from-indigo-500 to-purple-500",
        },
    ];

    const handleMouseEnter = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setDropdownOpen(true);
    };

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => setDropdownOpen(false), 200);
    };

    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    return (
        <header className="w-full sticky top-0 z-50 backdrop-blur-xl bg-gray-900/90 border-b border-gray-700/40 shadow-xl">
            <nav className="max-w-7xl mx-auto flex items-center justify-between px-4 md:px-6 py-3">
                {/* Logo */}
                <Link href="/" className="flex items-center flex-shrink-0">
                    <img
                        src="/images/joodw.png"
                        alt="JOOD"
                        className="w-24 md:w-28 h-auto object-contain hover:scale-105 transition"
                        onError={(e) => (e.target.src = "/images/logo.png")}
                    />
                </Link>

                {/* Desktop Menu*/}
                <div className="hidden lg:flex items-center gap-6 xl:gap-8 text-sm">
                    <Link
                        href="/"
                        className={`flex items-center gap-1.5 transition pb-1 ${
                            isActive("/") ? activeClass : inactiveClass
                        }`}
                    >
                        <Home size={16} /> {t("الرئيسية", "Home")}
                    </Link>

                    <Link
                        href="/what-to-cook"
                        className={`flex items-center gap-1.5 transition pb-1 whitespace-nowrap ${
                            isActive("/what-to-cook")
                                ? activeClass
                                : inactiveClass
                        }`}
                    >
                        <Lightbulb size={16} /> {t("شو اطبخ؟", "What to Cook?")}
                    </Link>

                    {/* Categories Dropdown */}
                    <div
                        className="relative"
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                        ref={dropdownRef}
                    >
                        <button
                            className={`flex items-center gap-1.5 transition pb-1 ${
                                isActive("/recipes")
                                    ? activeClass
                                    : inactiveClass
                            }`}
                        >
                            <Grid size={16} />
                            {t("الفئات", "Categories")}
                            <ChevronDown
                                size={14}
                                className={`transition-transform ${
                                    dropdownOpen ? "rotate-180" : ""
                                }`}
                            />
                        </button>

                        {dropdownOpen && (
                            <div className="absolute top-full left-0 mt-2 w-64 bg-gray-800 rounded-xl shadow-2xl border border-gray-700 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="p-2">
                                    <Link
                                        href="/recipes"
                                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-700 transition text-gray-200 hover:text-white"
                                    >
                                        <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500">
                                            <ChefHat
                                                size={16}
                                                className="text-white"
                                            />
                                        </div>
                                        <span className="font-medium">
                                            {t("كل الوصفات", "All Recipes")}
                                        </span>
                                    </Link>

                                    <div className="my-2 h-px bg-gray-700"></div>

                                    {categories.map((cat, idx) => {
                                        const Icon = cat.icon;
                                        return (
                                            <Link
                                                key={idx}
                                                href={`/recipes?category=${encodeURIComponent(
                                                    cat.nameEn
                                                )}`}
                                                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-700 transition text-gray-300 hover:text-white text-sm"
                                            >
                                                <div
                                                    className={`p-1.5 rounded-lg bg-gradient-to-br ${cat.color}`}
                                                >
                                                    <Icon
                                                        size={14}
                                                        className="text-white"
                                                    />
                                                </div>
                                                <span>
                                                    {lang === "ar"
                                                        ? cat.nameAr
                                                        : cat.nameEn}
                                                </span>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    <Link
                        href="/medical-recipes"
                        className={`flex items-center gap-1.5 transition pb-1 ${
                            isActive("/medical-recipes")
                                ? activeClass
                                : inactiveClass
                        }`}
                    >
                        <HeartPulseIcon size={16} />{" "}
                        {t("وصفات صحية", "Healthy Recipes")}
                    </Link>

                    <Link
                        href="/meal-planner"
                        className={`flex items-center gap-1.5 pb-1 ${
                            isActive("/meal-planner")
                                ? activeClass
                                : inactiveClass
                        }`}
                    >
                        <ListCheckIcon size={16} />{" "}
                        {t("مخطط الوجبات", "Meal Planner")}
                    </Link>

                    <Link
                        href="/kids-meals"
                        className={`flex items-center gap-1.5 pb-1 ${
                            isActive("/kids-meals")
                                ? activeClass
                                : inactiveClass
                        }`}
                    >
                        <BabyIcon size={16} />{" "}
                        {t("وجبات الأطفال", "Kids Meals")}
                    </Link>

                    <Link
                        href="/Magazine"
                        className={`flex items-center gap-1.5 transition pb-1 ${
                            isActive("/Magazine") ? activeClass : inactiveClass
                        }`}
                        aria-current={isActive("/Magazine") ? "page" : undefined}
                    >
                        <BookOpen size={16} aria-hidden="true" />{" "}
                        {t("مجلة جود", "Jood Magazine")}
                    </Link>
                </div>

                {/* Language + Auth (Desktop) */}
                <div className="hidden lg:flex items-center gap-3">
                    <button
                        onClick={() => changeLang(lang === "ar" ? "en" : "ar")}
                        className="px-4 py-2 bg-gray-800 text-gray-200 rounded-lg hover:bg-gray-700 transition text-sm font-medium"
                    >
                        {lang === "ar" ? "EN" : "ع"}
                    </button>
{/* 
                    {!isLoggedIn && !isAdmin ? (
                        <Link
                            href="/login"
                            className={`px-5 py-2 rounded-lg flex items-center gap-2 text-white font-medium transition ${
                                isActive("/login")
                                    ? "bg-green-700"
                                    : "bg-green-600 hover:bg-green-700"
                            }`}
                        >
                            <LogIn size={16} /> {t("دخول", "Login")}
                        </Link>
                    ) : isAdmin ? (
                        <Link
                            href="/admin"
                            className="px-5 py-2 bg-red-600 hover:bg-red-700 rounded-lg flex items-center gap-2 text-white font-medium transition"
                        >
                            <User size={16} /> {t("الإدارة", "Admin")}
                        </Link>
                    ) : (
                        <Link
                            href="/dashboard"
                            className={`px-5 py-2 rounded-lg flex items-center gap-2 text-white font-medium transition ${
                                isActive("/dashboard")
                                    ? "bg-green-700"
                                    : "bg-green-600 hover:bg-green-700"
                            }`}
                        >
                            <User size={16} /> {t("حسابي", "My Account")}
                        </Link>
                    )} */}
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    className="lg:hidden text-white p-2"
                    onClick={() => setOpen(!open)}
                >
                    {open ? <X size={28} /> : <Menu size={28} />}
                </button>
            </nav>

            {/* Mobile Menu */}
            {open && (
                <div className="lg:hidden px-4 py-6 bg-gray-900/95 backdrop-blur-xl border-t border-gray-700">
                    <div className="flex flex-col gap-3 text-gray-200">
                        <Link
                            href="/"
                            className={`flex items-center gap-3 p-3 rounded-lg transition ${
                                isActive("/")
                                    ? "bg-green-600 text-white"
                                    : "hover:bg-gray-800"
                            }`}
                            onClick={() => setOpen(false)}
                        >
                            <Home size={20} /> {t("الرئيسية", "Home")}
                        </Link>

                        <Link
                            href="/what-to-cook"
                            className={`flex items-center gap-3 p-3 rounded-lg transition ${
                                isActive("/what-to-cook")
                                    ? "bg-green-600 text-white"
                                    : "hover:bg-gray-800"
                            }`}
                            onClick={() => setOpen(false)}
                        >
                            <Lightbulb size={20} />{" "}
                            {t("شو اطبخ؟", "What to Cook?")}
                        </Link>

                        <div>
                            <Link
                                href="/recipes"
                                className={`flex items-center gap-3 p-3 rounded-lg transition ${
                                    isActive("/recipes")
                                        ? "bg-green-600 text-white"
                                        : "hover:bg-gray-800"
                                }`}
                                onClick={() => setOpen(false)}
                            >
                                <ChefHat size={20} />{" "}
                                {t("كل الوصفات", "All Recipes")}
                            </Link>
                            <div className="mt-2 ml-8 space-y-1">
                                {categories.map((cat, idx) => {
                                    const Icon = cat.icon;
                                    return (
                                        <Link
                                            key={idx}
                                            href={`/recipes?category=${encodeURIComponent(
                                                cat.nameEn
                                            )}`}
                                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800 transition text-sm"
                                            onClick={() => setOpen(false)}
                                        >
                                            <div
                                                className={`p-1.5 rounded bg-gradient-to-br ${cat.color}`}
                                            >
                                                <Icon
                                                    size={14}
                                                    className="text-white"
                                                />
                                            </div>
                                            <span>
                                                {lang === "ar"
                                                    ? cat.nameAr
                                                    : cat.nameEn}
                                            </span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>

                        <Link
                            href="/medical-recipes"
                            className={`flex items-center gap-3 p-3 rounded-lg transition ${
                                isActive("/medical-recipes")
                                    ? "bg-green-600 text-white"
                                    : "hover:bg-gray-800"
                            }`}
                            onClick={() => setOpen(false)}
                        >
                            <HeartPulseIcon size={20} />{" "}
                            {t("وصفات صحية", "Healthy Recipes")}
                        </Link>

                        <Link
                            href="/meal-planner"
                            className={`flex items-center gap-3 p-3 rounded-lg transition ${
                                isActive("/meal-planner")
                                    ? "bg-green-600 text-white"
                                    : "hover:bg-gray-800"
                            }`}
                            onClick={() => setOpen(false)}
                        >
                            <ListCheckIcon size={20} />{" "}
                            {t("مخطط الوجبات", "Meal Planner")}
                        </Link>

                        <Link
                            href="/kids-meals"
                            className={`flex items-center gap-3 p-3 rounded-lg transition ${
                                isActive("/kids-meals")
                                    ? "bg-green-600 text-white"
                                    : "hover:bg-gray-800"
                            }`}
                            onClick={() => setOpen(false)}
                        >
                            <BabyIcon size={20} />{" "}
                            {t("وجبات الأطفال", "Kids Meals")}
                        </Link>

                        <Link
                            href="/Magazine"
                            className={`flex items-center gap-3 p-3 rounded-lg transition ${
                                isActive("/Magazine")
                                    ? "bg-green-600 text-white"
                                    : "hover:bg-gray-800"
                            }`}
                            onClick={() => setOpen(false)}
                        >
                            <BookOpen size={20} />{" "}
                            {t("مجلة جود", "Jood Magazine")}
                        </Link>

                        <div className="mt-6 pt-6 border-t border-gray-700 space-y-4">
                            <button
                                onClick={() => {
                                    changeLang(lang === "ar" ? "en" : "ar");
                                    setOpen(false);
                                }}
                                className="w-full py-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition font-medium"
                            >
                                {lang === "ar" ? "English" : "عربي"}
                            </button>

                            {!isLoggedIn && !isAdmin ? (
                                <Link
                                    href="/login"
                                    className="w-full py-3 bg-green-600 hover:bg-green-700 rounded-lg flex items-center justify-center gap-2 text-white font-medium transition"
                                    onClick={() => setOpen(false)}
                                >
                                    <LogIn size={20} />{" "}
                                    {t("تسجيل الدخول", "Sign In")}
                                </Link>
                            ) : isAdmin ? (
                                <Link
                                    href="/admin"
                                    className="w-full py-3 bg-red-600 hover:bg-red-700 rounded-lg flex items-center justify-center gap-2 text-white font-medium transition"
                                    onClick={() => setOpen(false)}
                                >
                                    <User size={20} />{" "}
                                    {t("لوحة الإدارة", "Admin Panel")}
                                </Link>
                            ) : (
                                <Link
                                    href="/dashboard"
                                    className="w-full py-3 bg-green-600 hover:bg-green-700 rounded-lg flex items-center justify-center gap-2 text-white font-medium transition"
                                    onClick={() => setOpen(false)}
                                >
                                    <User size={20} />{" "}
                                    {t("حسابي", "My Account")}
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
