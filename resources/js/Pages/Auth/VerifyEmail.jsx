import { useState, useEffect } from "react";
import { Mail, ChefHat, CheckCircle, RefreshCw, LogOut } from "lucide-react";

export default function JoodVerifyEmail() {
    const [darkMode, setDarkMode] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [resending, setResending] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleResend = (e) => {
        e.preventDefault();
        setResending(true);
        // Simulate API call
        setTimeout(() => {
            setResending(false);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 5000);
        }, 1000);
    };

    const handleLogout = () => {
        console.log("Logging out...");
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
                    {/* Centered verification card */}
                    <div
                        className={`w-full max-w-lg ${
                            mounted ? "animate-fade-in" : "opacity-0"
                        }`}
                    >
                        {/* Logo */}
                        <div className="flex items-center justify-center gap-3 mb-8">
                            {/* <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30">
                                <ChefHat className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
                                    JOOD
                                </h1>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                    Smart Cooking Platform
                                </p>
                            </div> */}
                        </div>

                        {/* Verification card */}
                        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-8 md:p-10">
                            <div className="text-center mb-8">
                                <div className="w-20 h-20 bg-blue-500/10 dark:bg-blue-500/20 rounded-full flex items-center justify-center mb-6 mx-auto">
                                    <Mail className="w-10 h-10 text-blue-500" />
                                </div>
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                                    Verify your email
                                </h2>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                    Thanks for signing up! Before getting
                                    started, could you verify your email address
                                    by clicking on the link we just emailed to
                                    you?
                                </p>
                            </div>

                            {/* Success message */}
                            {showSuccess && (
                                <div
                                    className={`mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 rounded-xl flex items-start gap-3 ${
                                        mounted ? "animate-slide-down" : ""
                                    }`}
                                >
                                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-500 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-green-800 dark:text-green-300">
                                        A new verification link has been sent to
                                        the email address you provided during
                                        registration.
                                    </p>
                                </div>
                            )}

                            {/* Info box */}
                            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl">
                                <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                                    If you didn't receive the email, check your
                                    spam folder or click the button below to
                                    resend it.
                                </p>
                            </div>

                            <div className="space-y-4">
                                {/* Resend button */}
                                <button
                                    onClick={handleResend}
                                    disabled={resending}
                                    className="w-full py-3.5 bg-gradient-to-r from-green-600 to-green-500 text-white font-semibold rounded-xl shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                                >
                                    {resending ? (
                                        <>
                                            <RefreshCw className="w-5 h-5 animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <Mail className="w-5 h-5" />
                                            Resend Verification Email
                                        </>
                                    )}
                                </button>

                                {/* Logout button */}
                                <button
                                    onClick={handleLogout}
                                    className="w-full py-3 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 transition-colors flex items-center justify-center gap-2"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Log out
                                </button>
                            </div>
                        </div>

                        {/* Additional info */}
                        <div className="mt-6 text-center">
                            <p className="text-xs text-gray-500 dark:text-gray-500 mb-2">
                                Need help? Contact our support team
                            </p>
                            <a
                                href={route("logout")}
                                className="text-sm font-medium text-green-600 hover:text-green-700 dark:text-green-500 dark:hover:text-green-400 transition-colors"
                            >
                                support@jood.com
                            </a>
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

                    @keyframes slide-down {
                        from {
                            opacity: 0;
                            transform: translateY(-10px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }

                    .animate-fade-in {
                        animation: fade-in 0.6s ease-out forwards;
                    }

                    .animate-slide-down {
                        animation: slide-down 0.4s ease-out forwards;
                    }
                `}</style>
            </div>
        </div>
    );
}
