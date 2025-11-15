import { useState, useEffect } from "react";
import { Eye, EyeOff, Lock, ChefHat, Shield, AlertCircle } from "lucide-react";

export default function JoodConfirmPassword() {
    const [showPassword, setShowPassword] = useState(false);
    const [password, setPassword] = useState("");
    const [darkMode, setDarkMode] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Password confirmed:", password);
    };

    return (
        <div className={`min-h-screen ${darkMode ? "dark" : ""}`}>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50 dark:from-[#0F0F0F] dark:via-[#1a1a1a] dark:to-[#0a2f1a] transition-colors duration-500">
                {/* Floating background elements */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none">
                    <div
                        className={`absolute top-20 left-20 w-72 h-72 bg-green-400/20 dark:bg-green-500/10 rounded-full blur-3xl ${
                            mounted ? "animate-pulse" : ""
                        }`}
                        style={{ animationDuration: "4s" }}
                    ></div>
                    <div
                        className={`absolute bottom-20 right-20 w-96 h-96 bg-green-500/15 dark:bg-green-600/10 rounded-full blur-3xl ${
                            mounted ? "animate-pulse" : ""
                        }`}
                        style={{
                            animationDuration: "6s",
                            animationDelay: "1s",
                        }}
                    ></div>
                </div>

                {/* Dark mode toggle */}
                <button
                    onClick={() => setDarkMode(!darkMode)}
                    className="fixed top-6 right-6 z-50 p-3 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-lg hover:shadow-xl transition-all duration-300"
                >
                    {darkMode ? "☀️" : "🌙"}
                </button>

                {/* Main container */}
                <div className="relative min-h-screen flex items-center justify-center p-8">
                    {/* Centered confirmation card */}
                    <div
                        className={`w-full max-w-md ${
                            mounted ? "animate-fade-in" : "opacity-0"
                        }`}
                    >
                        {/* Logo */}
                        <div className="flex items-center justify-center gap-3 mb-8">
                            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30">
                                <ChefHat className="w-7 h-7 text-white" />
                            </div>
                            {/* <div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
                                    JOOD
                                </h1>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                    Smart Cooking Platform
                                </p>
                            </div> */}
                        </div>

                        {/* Confirmation card */}
                        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-8 md:p-10">
                            <div className="mb-8 text-center">
                                <div className="w-16 h-16 bg-amber-500/10 dark:bg-amber-500/20 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                                    <Shield className="w-8 h-8 text-amber-500" />
                                </div>
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                                    Confirm your password
                                </h2>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                    This is a secure area of the application.
                                    Please confirm your password before
                                    continuing.
                                </p>
                            </div>

                            {/* Security notice */}
                            <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-xl flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-amber-800 dark:text-amber-300">
                                    For your security, we need to verify your
                                    identity before accessing sensitive
                                    information.
                                </p>
                            </div>

                            <div className="space-y-6">
                                {/* Password field */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Password
                                    </label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-green-500 transition-colors duration-300" />
                                        <input
                                            type={
                                                showPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            value={password}
                                            onChange={(e) =>
                                                setPassword(e.target.value)
                                            }
                                            className="w-full pl-12 pr-12 py-3.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 transition-all duration-300"
                                            placeholder="Enter your password"
                                            required
                                            autoFocus
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowPassword(!showPassword)
                                            }
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-300"
                                        >
                                            {showPassword ? (
                                                <EyeOff className="w-5 h-5" />
                                            ) : (
                                                <Eye className="w-5 h-5" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Submit button */}
                                <button
                                    onClick={handleSubmit}
                                    className="w-full py-3.5 bg-gradient-to-r from-green-600 to-green-500 text-white font-semibold rounded-xl shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                                >
                                    Confirm Password
                                </button>

                                {/* Cancel/Back link */}
                                <button
                                    onClick={() => window.history.back()}
                                    className="w-full py-3 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>

                        {/* Additional info */}
                        <p className="text-center text-xs text-gray-500 dark:text-gray-500 mt-6">
                            Your password is encrypted and secure
                        </p>
                    </div>
                </div>

                <style jsx>{`
                    @keyframes fade-in {
                        from {
                            opacity: 0;
                            transform: translateY(10px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }

                    .animate-fade-in {
                        animation: fade-in 0.6s ease-out forwards;
                    }
                `}</style>
            </div>
        </div>
    );
}
