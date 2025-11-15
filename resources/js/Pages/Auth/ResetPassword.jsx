import { useState, useEffect } from "react";
import {
    Eye,
    EyeOff,
    Mail,
    Lock,
    ChefHat,
    Sparkles,
    Clock,
    Heart,
    Key,
} from "lucide-react";

export default function JoodResetPassword() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [email, setEmail] = useState("user@example.com"); // Pre-filled from token
    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const [darkMode, setDarkMode] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Password reset:", {
            email,
            password,
            passwordConfirmation,
        });
    };

    // const features = [
    //     {
    //         icon: <Sparkles className="w-5 h-5" />,
    //         title: "AI-Powered Assistant",
    //         description: "Smart cooking guidance at every step",
    //     },
    //     {
    //         icon: <ChefHat className="w-5 h-5" />,
    //         title: "Smart Recipe Suggestions",
    //         description: "Based on your available ingredients",
    //     },
    //     {
    //         icon: <Heart className="w-5 h-5" />,
    //         title: "Personalized Meals",
    //         description: "Tailored to your taste and dietary needs",
    //     },
    //     {
    //         icon: <Clock className="w-5 h-5" />,
    //         title: "Fast & Intuitive",
    //         description: "Simple cooking experience for everyone",
    //     },
    // ];

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
                <div className="relative min-h-screen flex">
                    {/* Left side - Hero section */}
                    <div
                        className={`hidden lg:flex lg:w-1/2 relative overflow-hidden ${
                            mounted ? "animate-fade-in" : "opacity-0"
                        }`}
                    >
                        <div className="relative w-full h-full flex flex-col justify-center px-16 xl:px-24">
                            {/* Logo and brand */}
                            <div className="mb-12 transform hover:scale-105 transition-transform duration-300">
                                {/* <div className="flex items-center gap-3 mb-4">
                                    <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/30">
                                        <ChefHat className="w-8 h-8 text-white" />
                                    </div>
                                    <div>
                                        <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
                                            JOOD
                                        </h1>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Smart Cooking Platform
                                        </p>
                                    </div>
                                </div> */}
                            </div>

                            {/* Welcome message */}
                            <div className="mb-12">
                                <h2 className="text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                                    Create a new
                                    <span className="block bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
                                        secure password
                                    </span>
                                </h2>
                                <p className="text-lg text-gray-600 dark:text-gray-400">
                                    Choose a strong password to keep your
                                    account safe and secure
                                </p>
                            </div>

                            {/* Features grid */}
                            {/* <div className="grid grid-cols-2 gap-6">
                                {features.map((feature, idx) => (
                                    <div
                                        key={idx}
                                        className={`group ${
                                            mounted
                                                ? "animate-slide-up"
                                                : "opacity-0"
                                        }`}
                                        style={{
                                            animationDelay: `${idx * 100}ms`,
                                        }}
                                    >
                                        <div className="p-5 rounded-2xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl hover:scale-105 transition-all duration-300">
                                            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-3 text-white group-hover:rotate-12 transition-transform duration-300">
                                                {feature.icon}
                                            </div>
                                            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                                                {feature.title}
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {feature.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div> */}
                        </div>
                    </div>

                    {/* Right side - Reset Password form */}
                    <div
                        className={`w-full lg:w-1/2 flex items-center justify-center p-8 ${
                            mounted ? "animate-fade-in" : "opacity-0"
                        }`}
                        style={{ animationDelay: "200ms" }}
                    >
                        <div className="w-full max-w-md">
                            {/* Mobile logo */}
                            <div className="lg:hidden flex items-center gap-3 mb-8">
                                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
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

                            {/* Form card */}
                            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-8 md:p-10">
                                <div className="mb-8">
                                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-green-500/30">
                                        <Key className="w-8 h-8 text-white" />
                                    </div>
                                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                        Reset your password
                                    </h2>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Enter your email and choose a new secure
                                        password
                                    </p>
                                </div>

                                <div className="space-y-5">
                                    {/* Email field (read-only or editable) */}
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Email
                                        </label>
                                        <div className="relative group">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-green-500 transition-colors duration-300" />
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) =>
                                                    setEmail(e.target.value)
                                                }
                                                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 transition-all duration-300"
                                                placeholder="your@email.com"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Password field */}
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            New Password
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
                                                placeholder="••••••••"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowPassword(
                                                        !showPassword
                                                    )
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
                                        <p className="text-xs text-gray-500 dark:text-gray-500">
                                            Use at least 8 characters with a mix
                                            of letters, numbers & symbols
                                        </p>
                                    </div>

                                    {/* Confirm Password field */}
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Confirm New Password
                                        </label>
                                        <div className="relative group">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-green-500 transition-colors duration-300" />
                                            <input
                                                type={
                                                    showConfirmPassword
                                                        ? "text"
                                                        : "password"
                                                }
                                                value={passwordConfirmation}
                                                onChange={(e) =>
                                                    setPasswordConfirmation(
                                                        e.target.value
                                                    )
                                                }
                                                className="w-full pl-12 pr-12 py-3.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 transition-all duration-300"
                                                placeholder="••••••••"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowConfirmPassword(
                                                        !showConfirmPassword
                                                    )
                                                }
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-300"
                                            >
                                                {showConfirmPassword ? (
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
                                        className="w-full py-3.5 bg-gradient-to-r from-green-600 to-green-500 text-white font-semibold rounded-xl shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 mt-2"
                                    >
                                        Reset Password
                                    </button>

                                    {/* Back to login */}
                                    <p className="text-center text-sm text-gray-600 dark:text-gray-400 pt-2">
                                        Remember your password?{" "}
                                        <a
                                            href="/login"
                                            className="font-medium text-green-600 hover:text-green-700 dark:text-green-500 dark:hover:text-green-400 transition-colors"
                                        >
                                            Log in
                                        </a>
                                    </p>
                                </div>
                            </div>

                            {/* Additional info */}
                            <p className="text-center text-xs text-gray-500 dark:text-gray-500 mt-6">
                                After resetting, you'll be redirected to login
                                with your new password
                            </p>
                        </div>
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

                    @keyframes slide-up {
                        from {
                            opacity: 0;
                            transform: translateY(20px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }

                    .animate-fade-in {
                        animation: fade-in 0.6s ease-out forwards;
                    }

                    .animate-slide-up {
                        animation: slide-up 0.6s ease-out forwards;
                    }
                `}</style>
            </div>
        </div>
    );
}
