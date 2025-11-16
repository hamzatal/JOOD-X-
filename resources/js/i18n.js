import i18next from "i18next";
import { initReactI18next } from "react-i18next";

import ar from "./i18n/ar.json";
import en from "./i18n/en.json";

const resources = {
    ar: { translation: ar },
    en: { translation: en },
};

i18next.use(initReactI18next).init({
    resources,
    lng: sessionStorage.getItem("locale") || "ar",
    fallbackLng: "en",
    interpolation: {
        escapeValue: false,
    },
});

export default i18next;
