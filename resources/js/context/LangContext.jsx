import { createContext, useContext, useState, useEffect } from "react";

const LangContext = createContext();

const translations = {
    ar: {
        navbar: {
            home: "الرئيسية",
            recipes: "الوصفات",
            whatCook: "شو اطبخ؟",
            trending: "الرائج الآن",
            stores: "المتاجر",
            login: "تسجيل الدخول",
            dashboard: "لوحة التحكم",
            admin: "مدير النظام",
        },
    },
    en: {
        navbar: {
            home: "Home",
            recipes: "Recipes",
            whatCook: "What to Cook?",
            trending: "Trending",
            stores: "Stores",
            login: "Sign In",
            dashboard: "Dashboard",
            admin: "Admin Panel",
        },
    },
};

export function LangProvider({ children }) {
    const [lang, setLang] = useState("ar");

    useEffect(() => {
        const stored = localStorage.getItem("lang") || "ar";
        setLang(stored);

        document.documentElement.dir = stored === "ar" ? "rtl" : "ltr";
        document.documentElement.lang = stored;
    }, []);

    const changeLang = (newLang) => {
        setLang(newLang);
        localStorage.setItem("lang", newLang);
        document.documentElement.dir = newLang === "ar" ? "rtl" : "ltr";
        document.documentElement.lang = newLang;
        window.location.reload();
    };

    // t("navbar.home")
    const t = (key) => {
        const parts = key.split(".");
        return parts.reduce((obj, p) => obj?.[p], translations[lang]) || key;
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
