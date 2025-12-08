import React from "react";

export default function ShoppingListModal({ shopping, onClose, lang }) {
    if (!shopping) return null;
    return (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
            <div className="bg-gray-900 rounded-2xl w-full max-w-2xl p-6 border border-gray-800">
                <div className="flex items-start justify-between">
                    <h3 className="text-xl font-bold">
                        {lang === "ar" ? "قائمة التسوق" : "Shopping List"}
                    </h3>
                    <div className="flex gap-2">
                        <button
                            className="px-3 py-1 bg-gray-800 rounded"
                            onClick={() => {
                                const txt = shopping
                                    .map((s) => `${s.item} (${s.count})`)
                                    .join("\n");
                                navigator.clipboard.writeText(txt);
                                alert(lang === "ar" ? "تم النسخ" : "Copied");
                            }}
                        >
                            {lang === "ar" ? "نسخ" : "Copy"}
                        </button>
                        <button
                            className="px-3 py-1 bg-red-600 rounded"
                            onClick={onClose}
                        >
                            {lang === "ar" ? "إغلاق" : "Close"}
                        </button>
                    </div>
                </div>

                <div className="mt-4 max-h-80 overflow-auto">
                    <ul className="space-y-2">
                        {shopping.map((s, i) => (
                            <li
                                key={i}
                                className="flex justify-between items-center bg-gray-800/60 p-3 rounded"
                            >
                                <span>{s.item}</span>
                                <span className="text-sm text-gray-400">
                                    {s.count}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
