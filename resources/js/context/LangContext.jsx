// resources/js/context/LangContext.jsx

import { createContext, useContext, useState, useEffect } from "react";

const LangContext = createContext();

const translations = {
    ar: {
        // الناف بار
        الرئيسية: "الرئيسية",
        Home: "الرئيسية",
        "شو اطبخ؟": "شو اطبخ؟",
        "What to Cook?": "شو اطبخ؟",
        الفئات: "الفئات",
        Categories: "الفئات",
        "كل الوصفات": "كل الوصفات",
        "All Recipes": "كل الوصفات",
        "وصفات صحية": "وصفات صحية",
        Healthy: "وصفات صحية",
        "مخطط الوجبات": "مخطط الوجبات",
        "Meal Planner": "مخطط الوجبات",
        "وجبات الأطفال": "وجبات الأطفال",
        "Kids Meals": "وجبات الأطفال",
        المدونة: "المدونة",
        Blog: "المدونة",
        دخول: "دخول",
        Login: "دخول",
        "تسجيل الدخول": "تسجيل الدخول",
        "Sign In": "تسجيل الدخول",
        حسابي: "حسابي",
        Account: "حسابي",
        الإدارة: "الإدارة",
        Admin: "الإدارة",
        "لوحة الإدارة": "لوحة الإدارة",
        "Admin Panel": "لوحة الإدارة",

        // باقي النصوص في الموقع
        باستا: "باستا",
        Pasta: "باستا",
        نباتي: "نباتي",
        Vegetarian: "نباتي",
        حلويات: "حلويات",
        Desserts: "حلويات",
        "لحم بقر": "لحم بقر",
        Beef: "لحم بقر",
        دجاج: "دجاج",
        Chicken: "دجاج",
        فطور: "فطور",
        Breakfast: "فطور",
    },
    en: {
        الرئيسية: "Home",
        Home: "Home",
        "شو اطبخ؟": "What to Cook?",
        "What to Cook?": "What to Cook?",
        الفئات: "Categories",
        Categories: "Categories",
        "كل الوصفات": "All Recipes",
        "All Recipes": "All Recipes",
        "وصفات صحية": "Healthy Recipes",
        Healthy: "Healthy Recipes",
        "مخطط الوجبات": "Meal Planner",
        "Meal Planner": "Meal Planner",
        "وجبات الأطفال": "Kids Meals",
        "Kids Meals": "Kids Meals",
        المدونة: "Blog",
        Blog: "Blog",
        دخول: "Login",
        Login: "Login",
        "تسجيل الدخول": "Sign In",
        "Sign In": "Sign In",
        حسابي: "My Account",
        Account: "My Account",
        الإدارة: "Admin",
        Admin: "Admin",
        "لوحة الإدارة": "Admin Panel",
        "Admin Panel": "Admin Panel",

        باستا: "Pasta",
        Pasta: "Pasta",
        نباتي: "Vegetarian",
        Vegetarian: "Vegetarian",
        حلويات: "Desserts",
        Desserts: "Desserts",
        "لحم بقر": "Beef",
        Beef: "Beef",
        دجاج: "Chicken",
        Chicken: "Chicken",
        فطور: "Breakfast",
        Breakfast: "Breakfast",
    },
};

export function LangProvider({ children }) {
    const [lang, setLang] = useState("ar");

    // تحميل اللغة عند أول تشغيل
    useEffect(() => {
        const savedLang = localStorage.getItem("lang");
        const initialLang = savedLang || "ar";

        setLang(initialLang);
        document.documentElement.dir = initialLang === "ar" ? "rtl" : "ltr";
        document.documentElement.lang = initialLang;
    }, []);

    // دالة تغيير اللغة – بدون reload أبدًا
    const changeLang = (newLang) => {
        setLang(newLang);
        localStorage.setItem("lang", newLang);
        document.documentElement.dir = newLang === "ar" ? "rtl" : "ltr";
        document.documentElement.lang = newLang;
        // لا حاجة لـ reload، كل شيء يتغير فورًا
    };

    // دالة الترجمة البسيطة والسريعة
    const t = (arabicText, englishText) => {
        return lang === "ar" ? arabicText : englishText;
    };

    return (
        <LangContext.Provider value={{ lang, changeLang, t }}>
            {children}
        </LangContext.Provider>
    );
}

export function useLang() {
    return useContext(LangContext);
}
