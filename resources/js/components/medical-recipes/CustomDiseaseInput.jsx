import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SparklesIcon, XIcon, SendIcon, WandIcon } from "lucide-react";

export default function CustomDiseaseInput({ onSubmit, lang, loading }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [customText, setCustomText] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        if (customText.trim()) {
            onSubmit(customText);
            setCustomText("");
            setIsExpanded(false);
        }
    };

    const examples =
        lang === "ar"
            ? [
                  { icon: "🫘", text: "أنا مريض كلى وبدي أطبخ منسف" },
                  { icon: "🩸", text: "عندي سكري وبدي حلويات صحية" },
                  { icon: "❤️", text: "مريض قلب وبحب المشاوي" },
              ]
            : [
                  { icon: "🫘", text: "I have kidney disease, want Mansaf" },
                  {
                      icon: "🩸",
                      text: "I have diabetes, want healthy desserts",
                  },
                  { icon: "❤️", text: "Heart patient, love grilled food" },
              ];

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
        >
            {!isExpanded ? (
                <motion.div
                    whileHover={{ scale: 1.01 }}
                    onClick={() => setIsExpanded(true)}
                    className="relative cursor-pointer bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 rounded-3xl p-6 shadow-2xl overflow-hidden"
                >
                    <div className="absolute inset-0 opacity-20">
                        <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse" />
                        <div
                            className="absolute bottom-0 right-0 w-60 h-60 bg-pink-300 rounded-full blur-3xl animate-pulse"
                            style={{ animationDelay: "1s" }}
                        />
                    </div>

                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <motion.div
                                animate={{ rotate: [0, 10, -10, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center"
                            >
                                <WandIcon size={32} className="text-white" />
                            </motion.div>
                            <div className="text-left">
                                <h3 className="text-2xl font-bold text-white mb-1">
                                    {lang === "ar"
                                        ? "طلب مخصص وذكي"
                                        : "Smart Custom Request"}
                                </h3>
                                <p className="text-purple-100">
                                    {lang === "ar"
                                        ? "أخبرنا عن حالتك والطبق الذي تريده"
                                        : "Tell us your condition & desired dish"}
                                </p>
                            </div>
                        </div>
                        <motion.div
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            className="px-6 py-3 bg-white text-purple-700 rounded-2xl font-bold shadow-lg"
                        >
                            {lang === "ar" ? "ابدأ الآن" : "Start Now"} ✨
                        </motion.div>
                    </div>
                </motion.div>
            ) : (
                <AnimatePresence>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-gradient-to-br from-white to-purple-50 dark:from-gray-800 dark:to-purple-900/30 rounded-3xl shadow-2xl p-6 border-2 border-purple-200 dark:border-purple-700"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center">
                                    <SparklesIcon
                                        size={24}
                                        className="text-white"
                                    />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                        {lang === "ar"
                                            ? "طلبك المخصص"
                                            : "Your Custom Request"}
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {lang === "ar"
                                            ? "اكتب بالتفصيل"
                                            : "Describe in detail"}
                                    </p>
                                </div>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.1, rotate: 90 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setIsExpanded(false)}
                                className="w-10 h-10 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full flex items-center justify-center transition"
                            >
                                <XIcon
                                    size={20}
                                    className="text-gray-600 dark:text-gray-300"
                                />
                            </motion.button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="relative">
                                <textarea
                                    value={customText}
                                    onChange={(e) =>
                                        setCustomText(e.target.value)
                                    }
                                    placeholder={
                                        lang === "ar"
                                            ? "مثال: أنا مريض كلى وأريد طبخ منسف بطريقة صحية مع تقليل البوتاسيوم والصوديوم..."
                                            : "Example: I have kidney disease and want to cook Mansaf in a healthy way with reduced potassium and sodium..."
                                    }
                                    rows={5}
                                    maxLength={500}
                                    className="w-full px-5 py-4 bg-white dark:bg-gray-700 border-2 border-purple-200 dark:border-purple-600 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-300 dark:focus:ring-purple-500 text-gray-900 dark:text-white resize-none text-lg shadow-inner"
                                    disabled={loading}
                                />
                                <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                                    {customText.length}/500
                                </div>
                            </div>

                            <div>
                                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                    {lang === "ar"
                                        ? "أمثلة سريعة:"
                                        : "Quick examples:"}
                                </p>
                                <div className="grid md:grid-cols-3 gap-3">
                                    {examples.map((example, idx) => (
                                        <motion.button
                                            key={idx}
                                            type="button"
                                            whileHover={{ scale: 1.03, y: -2 }}
                                            whileTap={{ scale: 0.97 }}
                                            onClick={() =>
                                                setCustomText(example.text)
                                            }
                                            className="flex items-start gap-3 p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-900/40 dark:hover:to-pink-900/40 border-2 border-purple-200 dark:border-purple-700 rounded-xl text-left transition shadow-sm"
                                        >
                                            <span className="text-3xl">
                                                {example.icon}
                                            </span>
                                            <span className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                                {example.text}
                                            </span>
                                        </motion.button>
                                    ))}
                                </div>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={loading || !customText.trim()}
                                className="w-full px-8 py-5 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 text-white rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3"
                            >
                                {loading ? (
                                    <>
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{
                                                duration: 1,
                                                repeat: Infinity,
                                                ease: "linear",
                                            }}
                                        >
                                            <SparklesIcon size={24} />
                                        </motion.div>
                                        {lang === "ar"
                                            ? "جاري التوليد..."
                                            : "Generating..."}
                                    </>
                                ) : (
                                    <>
                                        <SendIcon size={24} />
                                        {lang === "ar"
                                            ? "توليد وصفات مخصصة"
                                            : "Generate Custom Recipes"}
                                    </>
                                )}
                            </motion.button>
                        </form>
                    </motion.div>
                </AnimatePresence>
            )}
        </motion.div>
    );
}
