import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { XIcon, SendIcon, BotIcon, UserIcon, LoaderIcon } from "lucide-react";
import axios from "axios";

export default function ChatBot({ isOpen, onClose, lang, condition }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            const welcomeMsg =
                lang === "ar"
                    ? "مرحبًا! أنا مساعدك الذكي للتغذية العلاجية 🌟\n\nكيف يمكنني مساعدتك؟"
                    : "Hello! I'm your medical nutrition assistant 🌟\n\nHow can I help you?";

            setMessages([
                {
                    role: "assistant",
                    content: welcomeMsg,
                    timestamp: new Date(),
                },
            ]);
        }
    }, [isOpen, lang]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMessage = {
            role: "user",
            content: input,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setLoading(true);

        try {
            const res = await axios.post("/api/medical-recipes/chatbot", {
                message: input,
                lang: lang,
            });

            const botMessage = {
                role: "assistant",
                content: res.data.message,
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, botMessage]);
        } catch (err) {
            console.error("Chat error:", err);
            const errorMsg = {
                role: "assistant",
                content:
                    lang === "ar"
                        ? "عذرًا، حدث خطأ. حاول مرة أخرى."
                        : "Sorry, an error occurred. Please try again.",
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMsg]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-0 md:p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ y: "100%", opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: "100%", opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white dark:bg-gray-800 w-full md:max-w-2xl h-[90vh] md:h-[85vh] md:rounded-3xl shadow-2xl flex flex-col overflow-hidden"
                    >
                        <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white p-5 flex items-center justify-between flex-shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                                    <BotIcon size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">
                                        {lang === "ar"
                                            ? "المساعد الذكي"
                                            : "AI Assistant"}
                                    </h3>
                                    <p className="text-sm text-green-100">
                                        {lang === "ar"
                                            ? "متصل الآن"
                                            : "Online now"}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition"
                            >
                                <XIcon size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50 dark:bg-gray-900">
                            {messages.map((msg, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex gap-3 ${
                                        msg.role === "user"
                                            ? "flex-row-reverse"
                                            : ""
                                    }`}
                                >
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                                            msg.role === "user"
                                                ? "bg-blue-600"
                                                : "bg-green-600"
                                        }`}
                                    >
                                        {msg.role === "user" ? (
                                            <UserIcon
                                                size={20}
                                                className="text-white"
                                            />
                                        ) : (
                                            <BotIcon
                                                size={20}
                                                className="text-white"
                                            />
                                        )}
                                    </div>

                                    <div
                                        className={`flex-1 ${
                                            msg.role === "user"
                                                ? "flex justify-end"
                                                : ""
                                        }`}
                                    >
                                        <div
                                            className={`inline-block max-w-[85%] rounded-2xl px-4 py-3 ${
                                                msg.role === "user"
                                                    ? "bg-blue-600 text-white"
                                                    : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-md"
                                            }`}
                                        >
                                            <p className="whitespace-pre-line text-sm leading-relaxed">
                                                {msg.content}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}

                            {loading && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex gap-3"
                                >
                                    <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                                        <BotIcon
                                            size={20}
                                            className="text-white"
                                        />
                                    </div>
                                    <div className="bg-white dark:bg-gray-800 rounded-2xl px-4 py-3 shadow-md">
                                        <div className="flex gap-2">
                                            <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" />
                                            <div
                                                className="w-2 h-2 bg-green-600 rounded-full animate-bounce"
                                                style={{
                                                    animationDelay: "0.2s",
                                                }}
                                            />
                                            <div
                                                className="w-2 h-2 bg-green-600 rounded-full animate-bounce"
                                                style={{
                                                    animationDelay: "0.4s",
                                                }}
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        <div className="p-5 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) =>
                                        e.key === "Enter" && handleSend()
                                    }
                                    placeholder={
                                        lang === "ar"
                                            ? "اكتب رسالتك..."
                                            : "Type your message..."
                                    }
                                    className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                                    disabled={loading}
                                />
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleSend}
                                    disabled={loading || !input.trim()}
                                    className="px-6 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl flex items-center justify-center disabled:opacity-50"
                                >
                                    {loading ? (
                                        <LoaderIcon
                                            size={20}
                                            className="animate-spin"
                                        />
                                    ) : (
                                        <SendIcon size={20} />
                                    )}
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
