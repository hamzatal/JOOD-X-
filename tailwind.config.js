/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: "class", 
    content: [
        "./resources/**/*.blade.php",
        "./resources/**/*.jsx",
        "./resources/**/*.js",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ["Montserrat", "sans-serif"],
            },
            colors: {
                // Light Mode
                primary: "#5F7F3B",
                secondary: "#D49D2F",
                background: "#F9F9F9",
                text: "#333333",
                textSecondary: "#666666",
                hover: "#4E6B32",
                success: "#7BB661",
                error: "#E94E3C",

                // Dark Mode
                dark: {
                    background: "#1F1F1F",
                    primary: "#5F7F3B",
                    secondary: "#B8851F",
                    text: "#F5F5F5",
                    textSecondary: "#CCCCCC",
                    hover: "#7BB661",
                    success: "#A3D18E",
                    error: "#F5625F",
                },
            },
        },
    },
    plugins: [],
};
