import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import RecipeModal from "@/components/MedicalRecipes/RecipeModal";
import { useLang } from "@/context/LangContext";

export default function ChatAssistantMedical() {
    const { lang } = useLang();
    const [messages, setMessages] = useState(() => {
        try {
            return JSON.parse(sessionStorage.getItem("medical_chat") || "[]");
        } catch {
            return [];
        }
    });
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState(null);
    const [isTyping, setIsTyping] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        if (messages.length === 0) {
            setMessages([
                {
                    id: Date.now(),
                    role: "assistant",
                    type: "text",
                    text:
                        lang === "ar"
                            ? "مرحباً! اكتب حالتك (مثال: أنا عندي كلى) ثم اطلب الوصفة أو استفسر عن الأطعمة. مثال: 'أنا معي ضغط وبدي اشرب عصير'."
                            : "Welcome! Type your condition (e.g. 'I have kidney disease') and ask a recipe or question (e.g. 'I have hypertension and want a juice').",
                },
            ]);
        }
    }, []);

    useEffect(() => {
        sessionStorage.setItem("medical_chat", JSON.stringify(messages));
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        setTimeout(() => {
            containerRef.current?.scrollTo({
                top: containerRef.current.scrollHeight,
                behavior: "smooth",
            });
        }, 100);
    };

    async function sendQuery(text) {
        if (!text.trim()) return;
        const userMsg = {
            id: Date.now(),
            role: "user",
            text: text.trim(),
            timestamp: new Date().toISOString(),
        };
        setMessages((m) => [...m, userMsg]);
        setInput("");
        setLoading(true);
        setIsTyping(true);

        try {
            const res = await axios.post(
                "/api/health-assistant",
                { prompt: text, lang },
                { timeout: 35000 }
            );
            setIsTyping(false);

            if (res.data.type === "recipe" && res.data.recipe) {
                const r = res.data.recipe;
                // normalize image field
                if (r.image_url && !r.image) r.image = r.image_url;
                const aiMsg = {
                    id: Date.now() + 1,
                    role: "assistant",
                    type: "recipe",
                    recipe: r,
                    message: res.data.message || null,
                    timestamp: new Date().toISOString(),
                };
                setMessages((m) => [...m, aiMsg]);
            } else if (res.data.type === "text") {
                const aiMsg = {
                    id: Date.now() + 1,
                    role: "assistant",
                    type: "text",
                    text: res.data.answer || "—",
                    suggestions: res.data.suggestions || null,
                    timestamp: new Date().toISOString(),
                };
                setMessages((m) => [...m, aiMsg]);
            } else {
                setMessages((m) => [
                    ...m,
                    {
                        id: Date.now() + 1,
                        role: "assistant",
                        type: "text",
                        text:
                            lang === "ar"
                                ? "لم أفهم الرد من الخادم."
                                : "Unexpected server response.",
                    },
                ]);
            }
        } catch (err) {
            console.error("Chat error", err);
            setIsTyping(false);
            setMessages((m) => [
                ...m,
                {
                    id: Date.now() + 1,
                    role: "assistant",
                    type: "text",
                    text:
                        lang === "ar"
                            ? "حصل خطأ. حاول مرة أخرى."
                            : "Error occurred. Try again.",
                },
            ]);
        } finally {
            setLoading(false);
            scrollToBottom();
        }
    }

    function onSubmit(e) {
        e.preventDefault();
        if (!loading && input.trim()) sendQuery(input);
    }

    const quickExamples = [
        lang === "ar"
            ? "وصفة منسف لمريض كلى"
            : "Mansaf recipe for kidney patient",
        lang === "ar" ? "مشروب مناسب لمرضى ضغط" : "Juice safe for hypertension",
        lang === "ar"
            ? "ما الأطعمة المفيدة لمرضى السكري؟"
            : "What foods are good for diabetes?",
    ];

    return (
        <div className="bg-gray-900/70 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-lg text-white">
                        🏥{" "}
                        {lang === "ar"
                            ? "المساعد الصحي الذكي"
                            : "Smart Health Assistant"}
                    </h3>
                    <button
                        onClick={() => {
                            if (
                                confirm(
                                    lang === "ar"
                                        ? "مسح المحادثة؟"
                                        : "Clear conversation?"
                                )
                            ) {
                                setMessages([]);
                                sessionStorage.removeItem("medical_chat");
                            }
                        }}
                        className="px-3 py-1 bg-red-500 text-white rounded-lg"
                    >
                        {lang === "ar" ? "مسح" : "Clear"}
                    </button>
                </div>
            </div>

            <div
                ref={containerRef}
                className="h-96 overflow-y-auto p-4 bg-gray-800/50 space-y-4 custom-scroll"
            >
                {messages.map((m) => (
                    <div
                        key={m.id}
                        className={`flex ${
                            m.role === "user" ? "justify-end" : "justify-start"
                        } animate-fadeIn`}
                    >
                        <div
                            className={`${
                                m.role === "user"
                                    ? "bg-gradient-to-r from-green-600 to-green-500 text-white"
                                    : "bg-gray-800 text-gray-100 border border-gray-700"
                            } p-4 rounded-2xl max-w-[90%] shadow-lg`}
                        >
                            {m.role === "user" && (
                                <div>
                                    <div className="whitespace-pre-line">
                                        {m.text}
                                    </div>
                                    <div className="text-xs opacity-70 mt-2">
                                        {new Date(
                                            m.timestamp
                                        ).toLocaleTimeString()}
                                    </div>
                                </div>
                            )}

                            {m.role === "assistant" && m.type === "text" && (
                                <div>
                                    <div className="whitespace-pre-line leading-relaxed">
                                        {m.text}
                                    </div>
                                    {m.suggestions && (
                                        <div className="mt-3 p-3 bg-gray-900/50 rounded border border-gray-700">
                                            {" "}
                                            {m.suggestions.recommended && (
                                                <div>
                                                    <strong className="text-green-400">
                                                        Recommended:
                                                    </strong>
                                                    <ul>
                                                        {m.suggestions.recommended.map(
                                                            (it, i) => (
                                                                <li key={i}>
                                                                    • {it}
                                                                </li>
                                                            )
                                                        )}
                                                    </ul>
                                                </div>
                                            )}{" "}
                                            {m.suggestions.avoid && (
                                                <div>
                                                    <strong className="text-red-400">
                                                        Avoid:
                                                    </strong>
                                                    <ul>
                                                        {m.suggestions.avoid.map(
                                                            (it, i) => (
                                                                <li key={i}>
                                                                    • {it}
                                                                </li>
                                                            )
                                                        )}
                                                    </ul>
                                                </div>
                                            )}{" "}
                                        </div>
                                    )}
                                </div>
                            )}

                            {m.role === "assistant" &&
                                m.type === "recipe" &&
                                m.recipe && (
                                    <div>
                                        {m.message && (
                                            <div className="mb-3 text-green-400">
                                                {m.message}
                                            </div>
                                        )}
                                        <div className="bg-gray-900/70 rounded-xl overflow-hidden border border-gray-700">
                                            <img
                                                src={
                                                    m.recipe.image ||
                                                    m.recipe.image_url
                                                }
                                                alt={m.recipe.title}
                                                className="w-full h-48 object-cover"
                                                onError={(e) =>
                                                    (e.target.src =
                                                        "https://via.placeholder.com/400x300?text=Recipe")
                                                }
                                            />
                                            <div className="p-4">
                                                <h3 className="text-xl font-bold text-white mb-2">
                                                    {m.recipe.title}
                                                </h3>
                                                <p className="text-gray-400 text-sm mb-3">
                                                    {m.recipe.description}
                                                </p>
                                                <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                                                    <div className="bg-gray-800/50 p-2 rounded">
                                                        <span className="text-gray-400">
                                                            Servings:
                                                        </span>{" "}
                                                        <span className="text-white font-medium ml-1">
                                                            {m.recipe
                                                                .servings ||
                                                                "—"}
                                                        </span>
                                                    </div>
                                                    <div className="bg-gray-800/50 p-2 rounded">
                                                        <span className="text-gray-400">
                                                            Prep:
                                                        </span>{" "}
                                                        <span className="text-white font-medium ml-1">
                                                            {m.recipe
                                                                .prep_time ||
                                                                "—"}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() =>
                                                            setSelected(
                                                                m.recipe
                                                            )
                                                        }
                                                        className="flex-1 px-4 py-2 bg-green-600 rounded-lg text-white"
                                                    >
                                                        📖 View
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            sendQuery(
                                                                (lang === "ar"
                                                                    ? "اعمل وصفة مشابهة لـ "
                                                                    : "Make a similar recipe to ") +
                                                                    m.recipe
                                                                        .title +
                                                                    (lang ===
                                                                    "ar"
                                                                        ? " بس أقل ملح"
                                                                        : " but lower sodium")
                                                            )
                                                        }
                                                        className="px-4 py-2 bg-gray-700 rounded-lg text-white"
                                                    >
                                                        🔄 Similar
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                        </div>
                    </div>
                ))}

                {isTyping && (
                    <div className="flex justify-start">
                        <div className="bg-gray-800 p-4 rounded-2xl border border-gray-700">
                            <div className="flex gap-2">
                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                                <div
                                    className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                                    style={{ animationDelay: "0.1s" }}
                                ></div>
                                <div
                                    className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                                    style={{ animationDelay: "0.2s" }}
                                ></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="px-4 py-2 bg-gray-800/30 border-t border-gray-700">
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {quickExamples.map((ex, i) => (
                        <button
                            key={i}
                            onClick={() => {
                                setInput(ex);
                                sendQuery(ex);
                            }}
                            className="px-3 py-1.5 bg-gray-700/50 rounded-full text-xs text-white"
                        >
                            {ex}
                        </button>
                    ))}
                </div>
            </div>

            <form
                onSubmit={onSubmit}
                className="p-4 bg-gray-800/50 border-t border-gray-700"
            >
                <div className="flex gap-2">
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={
                            lang === "ar"
                                ? "اكتب مثلاً: أنا معي كلى وبدّي وصفة منسف مناسبة"
                                : "Type e.g.: I have kidney disease and want a mansaf recipe"
                        }
                        className="flex-1 px-4 py-3 bg-gray-900 border border-gray-700 rounded-2xl text-white"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || loading}
                        className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 rounded-2xl text-white"
                    >
                        {loading
                            ? lang === "ar"
                                ? "جارٍ..."
                                : "Sending..."
                            : lang === "ar"
                            ? "إرسال"
                            : "Send"}
                    </button>
                </div>
            </form>

            {selected && (
                <RecipeModal
                    meal={selected}
                    onClose={() => setSelected(null)}
                />
            )}
        </div>
    );
}
