import { useState, useEffect } from "react";
import {
    Mail,
    ArrowLeft,
    ChefHat,
    Sparkles,
    Clock,
    Heart,
    Shield,
} from "lucide-react";

export default function JoodForgotPassword() {
    const [email, setEmail] = useState("");
    const [darkMode, setDarkMode] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Password reset requested for:", email);
        setSubmitted(true);
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
                               
                            </div>

                            {/* Welcome message */}
                            <div className="mb-12">
                                <h2 className="text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                                    Don't worry, we've
                                    <span className="block bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
                                        got you covered
                                    </span>
                                </h2>
                                <p className="text-lg text-gray-600 dark:text-gray-400">
                                    Reset your password securely and get back to
                                    your smart cooking journey in no time
                                </p>
                            </div>

                          
                        </div>
                    </div>

                    {/* Right side - Forgot Password form */}
                    <div
                        className={`w-full lg:w-1/2 flex items-center justify-center p-5 ${
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
                            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-7 md:p-9">
                                {!submitted ? (
                                    <>
                                        <div className="mb-8">
                                            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-green-500/30">
                                                <Shield className="w-8 h-8 text-white" />
                                            </div>
                                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                                                Forgot password?
                                            </h2>
                                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                                No problem. Just enter your
                                                email address and we'll send you
                                                a password reset link that will
                                                allow you to choose a new one.
                                            </p>
                                        </div>

                                        <div className="space-y-6">
                                            {/* Email field */}
                                            <div className="space-y-2">
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Email address
                                                </label>
                                                <div className="relative group">
                                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-green-500 transition-colors duration-300" />
                                                    <input
                                                        type="email"
                                                        value={email}
                                                        onChange={(e) =>
                                                            setEmail(
                                                                e.target.value
                                                            )
                                                        }
                                                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 transition-all duration-300"
                                                        placeholder="your@email.com"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            {/* Submit button */}
                                            <button
                                                onClick={handleSubmit}
                                                className="w-full py-3.5 bg-gradient-to-r from-green-600 to-green-500 text-white font-semibold rounded-xl shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                                            >
                                                Email Password Reset Link
                                            </button>

                                            {/* Back to login */}
                                            <a
                                                href="/login"
                                                className="flex items-center justify-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                                            >
                                                <ArrowLeft className="w-4 h-4" />
                                                Back to login
                                            </a>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        {/* Success message */}
                                        <div className="text-center">
                                            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mb-6 mx-auto shadow-lg shadow-green-500/30">
                                                <svg
                                                    className="w-10 h-10 text-white"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M5 13l4 4L19 7"
                                                    />
                                                </svg>
                                            </div>
                                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                                                Check your email
                                            </h2>
                                            <p className="text-gray-600 dark:text-gray-400 mb-2 leading-relaxed">
                                                We've sent a password reset link
                                                to
                                            </p>
                                            <p className="text-green-600 dark:text-green-500 font-semibold mb-6">
                                                {email}
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-500 mb-8">
                                                Didn't receive the email? Check
                                                your spam folder or try again.
                                            </p>

                                            <div className="space-y-3">
                                                <button
                                                    onClick={() =>
                                                        setSubmitted(false)
                                                    }
                                                    className="w-full py-3.5 bg-gradient-to-r from-green-600 to-green-500 text-white font-semibold rounded-xl shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                                                >
                                                    Resend email
                                                </button>

                                                <a
                                                    href="/login"
                                                    className="flex items-center justify-center gap-2 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                                                >
                                                    <ArrowLeft className="w-4 h-4" />
                                                    Back to login
                                                </a>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Additional info */}
                            <p className="text-center text-xs text-gray-500 dark:text-gray-500 mt-6">
                                Having trouble? Contact our support team for
                                assistance
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
