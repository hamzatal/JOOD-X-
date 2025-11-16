import "./bootstrap";
import "../css/app.css";

import React from "react";
import i18next from "./i18n";
import { I18nextProvider } from "react-i18next";

import { createRoot } from "react-dom/client";
import { createInertiaApp } from "@inertiajs/react";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";

const appName = import.meta.env.VITE_APP_NAME || "Laravel";

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob("./Pages/**/*.jsx")
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <I18nextProvider i18n={i18next}>
                <App {...props} />
            </I18nextProvider>
        );
    },
    progress: {
        color: "#5F7F3B",
    },
});

window.changeLanguage = (lng) => {
    i18next.changeLanguage(lng);
    sessionStorage.setItem("locale", lng);
    document.documentElement.dir = lng === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lng;
};
