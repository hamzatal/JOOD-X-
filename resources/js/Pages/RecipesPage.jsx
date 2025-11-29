import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "@/context/LangContext";
import {
    Search,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Sparkles,
    X,
    ChefHat as ChefHatIcon,
    Heart as HeartPulseIcon,
    Leaf as LeafIcon,
    Activity as ActivityIcon,
    Pizza,
    Salad,
    Cookie,
    Coffee,
    UtensilsCrossed,
    IceCream,
} from "lucide-react";
import axios from "axios";
import RecipeModal from "@/components/home/RecipeModal";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function RecipesPage() {
    const { lang, t } = useLang();
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [searching, setSearching] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState("all");

    const recipesPerPage = 12;
    const isRTL = lang === "ar";

    // ✅ Mapping بين الاسم الظاهر والـ API
    const CATEGORY_MAPPING = {
        "Pizza & Pasta": { id: "pasta", api: "Pasta" },
        "Healthy Salads": { id: "vegetarian", api: "Vegetarian" },
        Desserts: { id: "dessert", api: "Dessert" },
        Beverages: { id: "side", api: "Side" },
        "Main Courses": { id: "beef", api: "Beef" },
        Snacks: { id: "breakfast", api: "Breakfast" },
    };

    const categories = [
        {
            id: "all",
            icon: ChefHatIcon,
            name: t("الكل", "All"),
            apiName: "all",
            color: "from-green-500 to-emerald-500",
        },
        {
            id: "pasta",
            icon: Pizza,
            name: t("بيتزا وباستا", "Pizza & Pasta"),
            apiName: "Pasta",
            color: "from-red-500 to-orange-500",
        },
        {
            id: "vegetarian",
            icon: Salad,
            name: t("سلطات صحية", "Healthy Salads"),
            apiName: "Vegetarian",
            color: "from-green-500 to-emerald-500",
        },
        {
            id: "dessert",
            icon: Cookie,
            name: t("حلويات", "Desserts"),
            apiName: "Dessert",
            color: "from-pink-500 to-purple-500",
        },
        {
            id: "side",
            icon: Coffee,
            name: t("مشروبات", "Beverages"),
            apiName: "Side",
            color: "from-amber-500 to-yellow-500",
        },
        {
            id: "beef",
            icon: UtensilsCrossed,
            name: t("أطباق رئيسية", "Main Courses"),
            apiName: "Beef",
            color: "from-blue-500 to-cyan-500",
        },
        {
            id: "breakfast",
            icon: IceCream,
            name: t("وجبات خفيفة", "Snacks"),
            apiName: "Breakfast",
            color: "from-indigo-500 to-purple-500",
        },
    ];

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const categoryFromUrl = urlParams.get("category");

        if (categoryFromUrl) {
            // ✅ البحث في الـ mapping
            const mapping = CATEGORY_MAPPING[categoryFromUrl];

            if (mapping) {
                setSelectedCategory(mapping.id);
                fetchRecipesByCategory(mapping.api);
                return;
            }
        }

        fetchRecipes();
    }, [lang]);

    const fetchRecipes = async (forceRefresh = false) => {
        setLoading(true);
        try {
            const response = await axios.get(
                `/api/recipes?lang=${lang}&refresh=${forceRefresh}`
            );
            setRecipes(response.data.recipes || []);
        } catch (error) {
        } finally {
            setLoading(false);
        }
    };

    const fetchRecipesByCategory = async (
        categoryName,
        forceRefresh = false
    ) => {
        setLoading(true);
        setCurrentPage(1);
        try {
            const response = await axios.get(
                `/api/recipes/category/${categoryName}?lang=${lang}&refresh=${forceRefresh}`
            );
            setRecipes(response.data.recipes || []);
        } catch (error) {
        } finally {
            setLoading(false);
        }
    };

    const handleCategoryChange = (categoryId) => {
        setSelectedCategory(categoryId);
        setSearchQuery("");

        const category = categories.find((cat) => cat.id === categoryId);

        if (categoryId === "all") {
            window.history.pushState({}, "", "/recipes");
            fetchRecipes();
        } else {
            // استخدام الاسم الإنجليزي للـ URL
            const englishName =
                categories.find((c) => c.id === categoryId)?.name || "";
            const nameToUse =
                lang === "ar"
                    ? category.id === "pasta"
                        ? "Pizza & Pasta"
                        : category.id === "vegetarian"
                        ? "Healthy Salads"
                        : category.id === "dessert"
                        ? "Desserts"
                        : category.id === "side"
                        ? "Beverages"
                        : category.id === "beef"
                        ? "Main Courses"
                        : category.id === "breakfast"
                        ? "Snacks"
                        : englishName
                    : englishName;

            window.history.pushState(
                {},
                "",
                `/recipes?category=${encodeURIComponent(nameToUse)}`
            );
            fetchRecipesByCategory(category.apiName);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            handleCategoryChange(selectedCategory);
            return;
        }

        setSearching(true);
        try {
            const response = await axios.get(
                `/api/recipes/search?query=${searchQuery}&lang=${lang}`
            );
            setRecipes(response.data.recipes || []);
            setCurrentPage(1);
        } catch (error) {
            console.error("Search error:", error);
            const filtered = recipes.filter((recipe) => {
                const title = lang === "ar" ? recipe.strMealAr : recipe.strMeal;
                return title?.toLowerCase().includes(searchQuery.toLowerCase());
            });
            setRecipes(filtered);
        } finally {
            setSearching(false);
        }
    };

    const handleGenerateNew = () => {
        if (selectedCategory === "all") {
            fetchRecipes(true);
        } else {
            const category = categories.find(
                (cat) => cat.id === selectedCategory
            );
            fetchRecipesByCategory(category.apiName, true);
        }
    };

    const clearSearch = () => {
        setSearchQuery("");
        handleCategoryChange(selectedCategory);
    };

    const indexOfLastRecipe = currentPage * recipesPerPage;
    const indexOfFirstRecipe = indexOfLastRecipe - recipesPerPage;
    const currentRecipes = recipes.slice(indexOfFirstRecipe, indexOfLastRecipe);
    const totalPages = Math.ceil(recipes.length / recipesPerPage);

    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 500, behavior: "smooth" });
    };

    const RecipeCard = ({ recipe, index }) => {
        const title =
            lang === "ar" && recipe.strMealAr
                ? recipe.strMealAr
                : recipe.strMeal;
        const category =
            lang === "ar" && recipe.strCategoryAr
                ? recipe.strCategoryAr
                : recipe.strCategory;

        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -5 }}
                className="group cursor-pointer"
                onClick={() => setSelectedRecipe(recipe)}
            >
                <div className="bg-gray-800/40 rounded-xl overflow-hidden border border-gray-700/50 hover:border-green-500/50 transition-all">
                    <div className="relative h-40 overflow-hidden">
                        <img
                            src={
                                recipe.strMealThumb ||
                                "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400"
                            }
                            alt={title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>

                        <div className="absolute top-2 left-2">
                            <span className="px-2 py-1 bg-green-600/90 backdrop-blur-sm rounded-lg text-white text-xs font-medium">
                                {category}
                            </span>
                        </div>
                    </div>

                    <div className="p-3">
                        <h3 className="text-sm font-bold text-white line-clamp-2 group-hover:text-green-400 transition min-h-[40px]">
                            {title}
                        </h3>
                    </div>
                </div>
            </motion.div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
            <Navbar />

            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white py-16 px-6">
                <div className="absolute inset-0 overflow-hidden opacity-10">
                    <div className="absolute top-10 left-10 animate-float">
                        <LeafIcon size={60} />
                    </div>
                    <div className="absolute top-20 right-20 animate-float-delayed">
                        <ChefHatIcon size={80} />
                    </div>
                    <div className="absolute bottom-20 left-1/4 animate-float">
                        <ActivityIcon size={70} />
                    </div>
                    <div className="absolute bottom-10 right-1/3 animate-float-delayed">
                        <HeartPulseIcon size={90} />
                    </div>
                </div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center"
                    >
                        <div className="flex items-center justify-center gap-4 mb-4">
                            <motion.div
                                animate={{
                                    scale: [1, 1.2, 1],
                                    rotate: [0, 5, -5, 0],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    repeatDelay: 1,
                                }}
                            >
                                <HeartPulseIcon
                                    size={40}
                                    className="text-red-200"
                                />
                            </motion.div>

                            <h1 className="text-4xl md:text-6xl font-bold">
                                {t("مكتبة الوصفات", "Recipe Library")}
                            </h1>

                            <motion.div
                                animate={{
                                    scale: [1, 1.2, 1],
                                    rotate: [0, -5, 5, 0],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    repeatDelay: 1,
                                    delay: 0.5,
                                }}
                            >
                                <ChefHatIcon
                                    size={40}
                                    className="text-amber-200"
                                />
                            </motion.div>
                        </div>

                        <p className="text-lg md:text-xl text-green-100 max-w-3xl mx-auto mb-6">
                            {t(
                                "وصفات حلال شهية | سهلة التحضير | من مختلف المطابخ",
                                "Delicious halal recipes | Easy to prepare | From various cuisines"
                            )}
                        </p>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleGenerateNew}
                            disabled={loading}
                            className="px-8 py-3 bg-white text-green-700 rounded-2xl font-bold flex items-center gap-2 shadow-xl mx-auto hover:shadow-2xl transition-all disabled:opacity-50"
                        >
                            {loading ? (
                                <Loader2 size={20} className="animate-spin" />
                            ) : (
                                <Sparkles size={20} />
                            )}
                            {t("وصفات جديدة!", "New Recipes!")}
                        </motion.button>
                    </motion.div>
                </div>

                <div className="absolute bottom-0 left-0 right-0">
                    <svg
                        viewBox="0 0 1440 80"
                        className="w-full h-12 fill-gray-900"
                    >
                        <path d="M0,40L48,45C96,50,192,60,288,60C384,60,480,50,576,45C672,40,768,40,864,45C960,50,1056,60,1152,60C1248,60,1344,50,1392,45L1440,40L1440,80L0,80Z"></path>
                    </svg>
                </div>
            </section>

            {/* Categories */}
            <section className="px-4 md:px-8 py-6 bg-gray-900/50 border-b border-gray-800">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
                        {categories.map((cat) => {
                            const IconComponent = cat.icon;
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => handleCategoryChange(cat.id)}
                                    disabled={loading}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all flex-shrink-0 ${
                                        selectedCategory === cat.id
                                            ? `bg-gradient-to-r ${cat.color} text-white shadow-lg scale-105`
                                            : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                                    } disabled:opacity-50`}
                                >
                                    <IconComponent size={16} />
                                    <span className="font-medium text-sm">
                                        {cat.name}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Search */}
            <section className="px-4 md:px-8 py-6 bg-gray-900/30">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <div className="relative flex-1 w-full">
                            <Search
                                className={`absolute ${
                                    isRTL ? "right-3" : "left-3"
                                } top-1/2 -translate-y-1/2 text-gray-400`}
                                size={18}
                            />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={(e) =>
                                    e.key === "Enter" && handleSearch()
                                }
                                placeholder={t(
                                    "ابحث عن وصفة...",
                                    "Search for a recipe..."
                                )}
                                className={`w-full ${
                                    isRTL ? "pr-10 pl-10" : "pl-10 pr-10"
                                } py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-400 focus:outline-none focus:border-green-500 transition`}
                            />
                            {searchQuery && (
                                <button
                                    onClick={clearSearch}
                                    className={`absolute ${
                                        isRTL ? "left-3" : "right-3"
                                    } top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition`}
                                >
                                    <X size={18} />
                                </button>
                            )}
                        </div>

                        <button
                            onClick={handleSearch}
                            disabled={searching}
                            className="px-6 py-2.5 bg-green-600 hover:bg-green-700 rounded-lg text-white font-medium text-sm transition flex items-center gap-2 disabled:opacity-50"
                        >
                            {searching ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <Search size={16} />
                            )}
                            {t("بحث", "Search")}
                        </button>
                    </div>

                    <div className="mt-4 text-sm text-gray-400">
                        {t("عرض", "Showing")}{" "}
                        <span className="text-green-400 font-semibold">
                            {currentRecipes.length}
                        </span>{" "}
                        {t("من", "of")}{" "}
                        <span className="text-green-400 font-semibold">
                            {recipes.length}
                        </span>{" "}
                        {t("وصفة", "recipes")}
                    </div>
                </div>
            </section>

            {/* Recipes Grid */}
            <section className="px-4 md:px-8 py-8">
                <div className="max-w-7xl mx-auto">
                    {loading ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                            {[...Array(12)].map((_, i) => (
                                <div
                                    key={i}
                                    className="bg-gray-800/40 rounded-xl h-56 animate-pulse"
                                ></div>
                            ))}
                        </div>
                    ) : currentRecipes.length > 0 ? (
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentPage}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4"
                            >
                                {currentRecipes.map((recipe, i) => (
                                    <RecipeCard
                                        key={recipe.idMeal || i}
                                        recipe={recipe}
                                        index={i}
                                    />
                                ))}
                            </motion.div>
                        </AnimatePresence>
                    ) : (
                        <div className="text-center py-20">
                            <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="w-10 h-10 text-gray-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-400 mb-2">
                                {t("لا توجد نتائج", "No results found")}
                            </h3>
                            <p className="text-gray-500 text-sm mb-6">
                                {t(
                                    "جرب فئة أخرى أو بحث مختلف",
                                    "Try another category or different search"
                                )}
                            </p>
                            <button
                                onClick={() => handleCategoryChange("all")}
                                className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white text-sm font-medium transition"
                            >
                                {t("عرض كل الوصفات", "Show All Recipes")}
                            </button>
                        </div>
                    )}
                </div>
            </section>

            {/* Pagination */}
            {!loading && recipes.length > recipesPerPage && (
                <section className="px-4 md:px-8 pb-12">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-center justify-center gap-2">
                            <button
                                onClick={() => paginate(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
                            >
                                {isRTL ? (
                                    <ChevronRight size={20} />
                                ) : (
                                    <ChevronLeft size={20} />
                                )}
                            </button>

                            <div className="flex gap-2">
                                {[...Array(totalPages)].map((_, i) => {
                                    const pageNum = i + 1;
                                    if (
                                        pageNum === 1 ||
                                        pageNum === totalPages ||
                                        (pageNum >= currentPage - 1 &&
                                            pageNum <= currentPage + 1)
                                    ) {
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() =>
                                                    paginate(pageNum)
                                                }
                                                className={`w-10 h-10 rounded-lg font-medium transition ${
                                                    currentPage === pageNum
                                                        ? "bg-green-600 text-white"
                                                        : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                                                }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    } else if (
                                        pageNum === currentPage - 2 ||
                                        pageNum === currentPage + 2
                                    ) {
                                        return (
                                            <span
                                                key={pageNum}
                                                className="w-10 h-10 flex items-center justify-center text-gray-500"
                                            >
                                                ...
                                            </span>
                                        );
                                    }
                                    return null;
                                })}
                            </div>

                            <button
                                onClick={() => paginate(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
                            >
                                {isRTL ? (
                                    <ChevronLeft size={20} />
                                ) : (
                                    <ChevronRight size={20} />
                                )}
                            </button>
                        </div>

                        <div className="text-center mt-4 text-sm text-gray-500">
                            {t("صفحة", "Page")} {currentPage} {t("من", "of")}{" "}
                            {totalPages}
                        </div>
                    </div>
                </section>
            )}

            {selectedRecipe && (
                <RecipeModal
                    meal={selectedRecipe}
                    onClose={() => setSelectedRecipe(null)}
                    lang={lang}
                />
            )}

            <Footer />

            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                }
                @keyframes float-delayed {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-15px) rotate(5deg); }
                }
                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }
                .animate-float-delayed {
                    animation: float-delayed 8s ease-in-out infinite;
                }
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
}
