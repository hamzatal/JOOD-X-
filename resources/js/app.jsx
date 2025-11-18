import "./bootstrap";
import "../css/app.css";

import React from "react";
import { createRoot } from "react-dom/client";
import { createInertiaApp } from "@inertiajs/react";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";
import { LangProvider } from "./context/LangContext";

const appName = import.meta.env.VITE_APP_NAME || "JOOD";

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob("./Pages/**/*.jsx")
        ),
    setup({ el, App, props }) {
        createRoot(el).render(
            <LangProvider>
                <App {...props} />
            </LangProvider>
        );
    },
    progress: {
        color: "#5F7F3B",
    },
});
