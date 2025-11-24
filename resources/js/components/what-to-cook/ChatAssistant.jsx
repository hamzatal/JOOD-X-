import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import RecipeModal from "./RecipeModal";
import { useLang } from "@/context/LangContext";

export default function ChatAssistant() {
    const { lang } = useLang();
    const [messages, setMessages] = useState(() =>
        JSON.parse(sessionStorage.getItem("wtc_messages") || "[]")
    );
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState(null);
    const containerRef = useRef(null);

    useEffect(() => {
        sessionStorage.setItem("wtc_messages", JSON.stringify(messages));
        scrollToBottom();
    }, [messages]);

    function scrollToBottom() {
        setTimeout(() => {
            if (containerRef.current)
                containerRef.current.scrollTop =
                    containerRef.current.scrollHeight;
        }, 80);
    }

    async function sendQuery(text) {
        if (!text || text.trim() === "") return;
        const userMsg = { id: Date.now(), role: "user", text };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        try {
            const res = await axios.post("/api/what-to-cook", {
                prompt: text,
                lang,
            });
            if (res.data && res.data.recipe) {
                const recipe = res.data.recipe;
                const aiMsg = {
                    id: Date.now() + 1,
                    role: "assistant",
                    text:
                        recipe.title ||
                        (lang === "ar" ? "وصفة جاهزة" : "Recipe ready"),
                    recipe,
                };
                setMessages((prev) => [...prev, aiMsg]);
            } else {
                const fallback = {
                    id: Date.now() + 1,
                    role: "assistant",
                    text:
                        lang === "ar"
                            ? "لم يتم استقبال وصفة. جرّب تغيير الوصف."
                            : "No recipe returned. Try different input.",
                };
                setMessages((prev) => [...prev, fallback]);
            }
        } catch (err) {
            console.error("Chat error", err);
            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now() + 1,
                    role: "assistant",
                    text:
                        lang === "ar"
                            ? "حصل خطأ. حاول مرة اخرى."
                            : "Something went wrong. Try again.",
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

    return (
        <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-4 shadow-lg">
            <div className="flex items-center justify-between mb-3">
                <button
                    onClick={() => {
                        setMessages([]);
                        sessionStorage.removeItem("wtc_messages");
                    }}
                    className="px-3 py-1 bg-red-600 text-white rounded-md text-sm"
                >
                    {lang === "ar" ? "مسح" : "Clear"}
                </button>

                <h3 className="font-semibold">
                    {lang === "ar" ? "JOOD AI" : "JOOD AI "}
                </h3>
                <div className="text-xs text-gray-400">
                    {lang === "ar" ? "AI Chat BOOT" : "AI Chat BOOT"}
                </div>
            </div>

            <div
                ref={containerRef}
                className="h-72 overflow-y-auto p-3 rounded-md bg-gray-800/50 custom-scroll"
            >
                {messages.length === 0 && (
                    <div className="text-gray-400 text-sm text-center py-6">
                        {lang === "ar"
                            ? "اكتب مكوناتك أو اسأل..."
                            : "Type your ingredients or ask..."}
                    </div>
                )}
                {messages.map((m) => (
                    <div
                        key={m.id}
                        className={`flex ${
                            m.role === "user" ? "justify-end" : "justify-start"
                        } mb-3`}
                    >
                        <div
                            className={`max-w-[85%] px-4 py-3 rounded-2xl ${
                                m.role === "user"
                                    ? "bg-green-600 text-white"
                                    : "bg-gray-800 text-gray-100"
                            }`}
                        >
                            <div className="whitespace-pre-line">{m.text}</div>
                            {m.recipe && (
                                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <img
                                        src={m.recipe.image}
                                        alt={m.recipe.title}
                                        className="w-full h-28 object-cover rounded-md"
                                    />
                                    <div className="flex flex-col justify-between">
                                        <div>
                                            <div className="font-semibold">
                                                {m.recipe.title}
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                {m.recipe.description}
                                            </div>
                                        </div>
                                        <div className="flex gap-2 mt-2">
                                            <button
                                                onClick={() =>
                                                    setSelected(m.recipe)
                                                }
                                                className="px-3 py-1 bg-green-600 text-white rounded-md text-sm"
                                            >
                                                {lang === "ar" ? "عرض" : "View"}
                                            </button>
                                            <button
                                                onClick={() =>
                                                    sendQuery(
                                                        `Generate similar to: ${m.recipe.title}`
                                                    )
                                                }
                                                className="px-3 py-1 bg-gray-800 border border-gray-700 rounded-md text-sm"
                                            >
                                                {lang === "ar"
                                                    ? "توليد مشابه"
                                                    : "Generate similar"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <form onSubmit={onSubmit} className="mt-3 flex gap-2">
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={
                        lang === "ar"
                            ? "اكتب مكوناتك..."
                            : "Type ingredients or ask..."
                    }
                    className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-2xl"
                />
                <button
                    disabled={loading}
                    className="px-4 py-2 bg-green-600 rounded-2xl text-white"
                >
                    {loading
                        ? lang === "ar"
                            ? "جارٍ..."
                            : "Thinking..."
                        : lang === "ar"
                        ? "أرسل"
                        : "Send"}
                </button>
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
