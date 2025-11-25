import React, { useEffect, useRef, useState } from "react";
import RecipeModal from "./RecipeModal";
import { useLang } from "@/context/LangContext";
import {
    Send,
    Trash2,
    Sparkles,
    Copy,
    ThumbsUp,
    ThumbsDown,
    RefreshCw,
    Download,
} from "lucide-react";

export default function ChatAssistant() {
    const { lang } = useLang();
    const [messages, setMessages] = useState(() => {
        if (typeof sessionStorage !== "undefined") {
            return JSON.parse(sessionStorage.getItem("wtc_messages") || "[]");
        }
        return [];
    });
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState(null);
    const [typing, setTyping] = useState(false);
    const containerRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        if (typeof sessionStorage !== "undefined") {
            sessionStorage.setItem("wtc_messages", JSON.stringify(messages));
        }
        scrollToBottom();
    }, [messages]);

    function scrollToBottom() {
        setTimeout(() => {
            if (containerRef.current)
                containerRef.current.scrollTop =
                    containerRef.current.scrollHeight;
        }, 100);
    }

    async function sendQuery(text) {
        if (!text || text.trim() === "") return;

        const userMsg = {
            id: Date.now(),
            role: "user",
            text,
            timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setLoading(true);
        setTyping(true);

        try {
            const res = await fetch("/api/what-to-cook", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: text, lang }),
            });

            const data = await res.json();
            setTyping(false);

            if (data && data.recipe) {
                const recipe = data.recipe;
                const aiMsg = {
                    id: Date.now() + 1,
                    role: "assistant",
                    text:
                        recipe.title ||
                        (lang === "ar" ? "وصفة جاهزة" : "Recipe ready"),
                    recipe,
                    timestamp: new Date().toISOString(),
                    liked: null,
                };
                setMessages((prev) => [...prev, aiMsg]);
            } else {
                const fallback = {
                    id: Date.now() + 1,
                    role: "assistant",
                    text:
                        lang === "ar"
                            ? "لم أستطع إيجاد وصفة مناسبة. هل يمكنك تقديم تفاصيل أكثر؟"
                            : "I couldn't find a suitable recipe. Can you provide more details?",
                    timestamp: new Date().toISOString(),
                    liked: null,
                };
                setMessages((prev) => [...prev, fallback]);
            }
        } catch (err) {
            console.error("Chat error", err);
            setTyping(false);
            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now() + 1,
                    role: "assistant",
                    text:
                        lang === "ar"
                            ? "عذراً، حدث خطأ. يرجى المحاولة مرة أخرى."
                            : "Sorry, something went wrong. Please try again.",
                    timestamp: new Date().toISOString(),
                    liked: null,
                    error: true,
                },
            ]);
        } finally {
            setLoading(false);
            scrollToBottom();
        }
    }

    function onSubmit(e) {
        e.preventDefault();
        sendQuery(input);
    }

    function clearChat() {
        if (
            confirm(
                lang === "ar" ? "هل تريد مسح المحادثة؟" : "Clear conversation?"
            )
        ) {
            setMessages([]);
            if (typeof sessionStorage !== "undefined") {
                sessionStorage.removeItem("wtc_messages");
            }
        }
    }

    function copyMessage(text) {
        navigator.clipboard.writeText(text);
        alert(lang === "ar" ? "تم النسخ!" : "Copied!");
    }

    function regenerateResponse(userText) {
        sendQuery(userText);
    }

    function likeMessage(msgId, isLike) {
        setMessages((prev) =>
            prev.map((m) => (m.id === msgId ? { ...m, liked: isLike } : m))
        );
    }

    function exportChat() {
        const chatText = messages
            .map((m) => `[${m.role === "user" ? "You" : "AI"}]: ${m.text}`)
            .join("\n\n");

        const blob = new Blob([chatText], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `chat-${Date.now()}.txt`;
        a.click();
    }

    const suggestions =
        lang === "ar"
            ? [
                  "وصفة سريعة بالدجاج",
                  "حلى سهل وسريع",
                  "وجبة صحية للعشاء",
                  "ماذا أطبخ بالأرز؟",
              ]
            : [
                  "Quick chicken recipe",
                  "Easy dessert",
                  "Healthy dinner",
                  "What to cook with rice?",
              ];

    return (
        <div className="bg-gray-900/70 backdrop-blur-xl border border-gray-800 rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-green-600/20 to-green-600/20 border-b border-green-500/30 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-500 rounded-full flex items-center justify-center">
                                <Sparkles className="w-6 h-6 text-white" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900"></div>
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">
                                {lang === "ar"
                                    ? "مساعد الطبخ الذكي"
                                    : "AI Cooking Assistant"}
                            </h3>
                            <div className="text-xs text-gray-400 flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                {lang === "ar" ? "متصل الآن" : "Online now"}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={exportChat}
                            disabled={messages.length === 0}
                            className="p-2 hover:bg-gray-800 rounded-lg transition disabled:opacity-50"
                            title={
                                lang === "ar" ? "تصدير المحادثة" : "Export chat"
                            }
                        >
                            <Download className="w-5 h-5" />
                        </button>
                        <button
                            onClick={clearChat}
                            disabled={messages.length === 0}
                            className="p-2 hover:bg-red-600/20 rounded-lg transition text-red-400 disabled:opacity-50"
                            title={
                                lang === "ar" ? "مسح المحادثة" : "Clear chat"
                            }
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            <div
                ref={containerRef}
                className="h-[500px] overflow-y-auto p-4 space-y-4 custom-scroll bg-gradient-to-b from-gray-900/50 to-gray-900/80"
            >
                {messages.length === 0 && (
                    <div className="text-center py-12">
                        <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Sparkles className="w-10 h-10 text-white" />
                        </div>
                        <h4 className="text-xl font-bold mb-2">
                            {lang === "ar"
                                ? "مرحباً! كيف يمكنني مساعدتك؟"
                                : "Hello! How can I help you?"}
                        </h4>
                        <p className="text-gray-400 mb-6">
                            {lang === "ar"
                                ? "اسألني عن أي وصفة أو مكون تريده"
                                : "Ask me about any recipe or ingredient"}
                        </p>

                        <div className="grid grid-cols-2 gap-2 max-w-md mx-auto">
                            {suggestions.map((sug, i) => (
                                <button
                                    key={i}
                                    onClick={() => sendQuery(sug)}
                                    className="p-3 bg-gray-800/50 hover:bg-gray-800 rounded-xl text-sm transition border border-gray-700 hover:border-green-500/50"
                                >
                                    {sug}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {messages.map((m, index) => (
                    <div
                        key={m.id}
                        className={`flex ${
                            m.role === "user" ? "justify-end" : "justify-start"
                        } animate-fade-in`}
                    >
                        <div
                            className={`max-w-[85%] ${
                                m.role === "user" ? "order-2" : "order-1"
                            }`}
                        >
                            {m.role === "assistant" && (
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-500 rounded-full flex items-center justify-center">
                                        <Sparkles className="w-4 h-4 text-white" />
                                    </div>
                                    <span className="text-xs text-gray-400">
                                        AI Assistant
                                    </span>
                                </div>
                            )}

                            <div
                                className={`px-4 py-3 rounded-2xl ${
                                    m.role === "user"
                                        ? "bg-gradient-to-r from-green-600 to-green-600 text-white rounded-tr-none"
                                        : m.error
                                        ? "bg-red-900/30 border border-red-500/50 text-red-200 rounded-tl-none"
                                        : "bg-gray-800/80 backdrop-blur-sm border border-gray-700 text-gray-100 rounded-tl-none"
                                }`}
                            >
                                <div className="whitespace-pre-line">
                                    {m.text}
                                </div>

                                {m.recipe && (
                                    <div className="mt-4 bg-gray-900/50 rounded-xl overflow-hidden border border-gray-700">
                                        <div className="relative h-48">
                                            <img
                                                src={m.recipe.image}
                                                alt={m.recipe.title}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                                            <div className="absolute bottom-3 left-3 right-3">
                                                <h5 className="font-bold text-white text-lg mb-1">
                                                    {m.recipe.title}
                                                </h5>
                                                <p className="text-sm text-gray-300 line-clamp-2">
                                                    {m.recipe.description}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="p-3 flex gap-2">
                                            <button
                                                onClick={() =>
                                                    setSelected(m.recipe)
                                                }
                                                className="flex-1 py-2 bg-gradient-to-r from-green-600 to-green-600 text-white rounded-lg font-medium hover:scale-105 transition"
                                            >
                                                {lang === "ar"
                                                    ? "عرض الوصفة"
                                                    : "View Recipe"}
                                            </button>
                                            <button
                                                onClick={() =>
                                                    sendQuery(
                                                        `وصفة مشابهة لـ ${m.recipe.title}`
                                                    )
                                                }
                                                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition"
                                            >
                                                <RefreshCw className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div className="text-xs text-gray-400 mt-2">
                                    {new Date(m.timestamp).toLocaleTimeString(
                                        lang === "ar" ? "ar" : "en",
                                        {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        }
                                    )}
                                </div>
                            </div>

                            {m.role === "assistant" && !m.error && (
                                <div className="flex items-center gap-2 mt-2 ml-10">
                                    <button
                                        onClick={() => copyMessage(m.text)}
                                        className="p-1.5 hover:bg-gray-800 rounded-lg transition"
                                        title={lang === "ar" ? "نسخ" : "Copy"}
                                    >
                                        <Copy className="w-4 h-4 text-gray-400" />
                                    </button>
                                    <button
                                        onClick={() => likeMessage(m.id, true)}
                                        className={`p-1.5 hover:bg-gray-800 rounded-lg transition ${
                                            m.liked === true
                                                ? "text-green-500"
                                                : "text-gray-400"
                                        }`}
                                        title={
                                            lang === "ar" ? "أعجبني" : "Like"
                                        }
                                    >
                                        <ThumbsUp className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => likeMessage(m.id, false)}
                                        className={`p-1.5 hover:bg-gray-800 rounded-lg transition ${
                                            m.liked === false
                                                ? "text-red-500"
                                                : "text-gray-400"
                                        }`}
                                        title={
                                            lang === "ar"
                                                ? "لم يعجبني"
                                                : "Dislike"
                                        }
                                    >
                                        <ThumbsDown className="w-4 h-4" />
                                    </button>
                                    {index === messages.length - 1 && (
                                        <button
                                            onClick={() =>
                                                regenerateResponse(
                                                    messages[index - 1]?.text ||
                                                        ""
                                                )
                                            }
                                            className="p-1.5 hover:bg-gray-800 rounded-lg transition text-gray-400"
                                            title={
                                                lang === "ar"
                                                    ? "إعادة التوليد"
                                                    : "Regenerate"
                                            }
                                        >
                                            <RefreshCw className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {typing && (
                    <div className="flex justify-start animate-fade-in">
                        <div className="flex items-center gap-2 px-4 py-3 bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-2xl rounded-tl-none">
                            <div className="flex gap-1">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></span>
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce delay-100"></span>
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce delay-200"></span>
                            </div>
                            <span className="text-sm text-gray-400">
                                {lang === "ar" ? "يكتب..." : "Typing..."}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            <div className="border-t border-gray-800 bg-gray-900/50 p-4">
                <div className="flex gap-2" onSubmit={onSubmit}>
                    <input
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) =>
                            e.key === "Enter" && !e.shiftKey && onSubmit(e)
                        }
                        placeholder={
                            lang === "ar"
                                ? "اكتب رسالتك..."
                                : "Type your message..."
                        }
                        disabled={loading}
                        className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 transition"
                    />
                    <button
                        onClick={onSubmit}
                        disabled={loading || !input.trim()}
                        className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-600 text-white rounded-xl font-medium hover:scale-105 transition disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span className="hidden sm:inline">
                                    {lang === "ar" ? "جارٍ..." : "Sending..."}
                                </span>
                            </>
                        ) : (
                            <>
                                <Send className="w-5 h-5" />
                                <span className="hidden sm:inline">
                                    {lang === "ar" ? "إرسال" : "Send"}
                                </span>
                            </>
                        )}
                    </button>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                    {suggestions.slice(0, 2).map((sug, i) => (
                        <button
                            key={i}
                            onClick={() => {
                                setInput(sug);
                                inputRef.current?.focus();
                            }}
                            className="px-3 py-1.5 bg-gray-800/50 hover:bg-gray-800 rounded-lg text-sm transition border border-gray-700 text-gray-300"
                        >
                            {sug}
                        </button>
                    ))}
                </div>
            </div>

            {selected && (
                <RecipeModal
                    meal={selected}
                    onClose={() => setSelected(null)}
                />
            )}
        </div>
    );
}
