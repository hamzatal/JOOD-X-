// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import RecipeModal from "./RecipeModal";
// import { useLang } from "@/context/LangContext";

// export default function AIRecipesSection() {
//     const { t, lang } = useLang();
//     const [recipes, setRecipes] = useState([]);
//     const [updatedAt, setUpdatedAt] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [generating, setGenerating] = useState(false);
//     const [show, setShow] = useState(null);

//     // Fetch from API
//     const fetchRecipes = async () => {
//         setLoading(true);
//         try {
//             const res = await axios.get("/api/ai-recipes");
//             if (res.data) {
//                 setRecipes(res.data.recipes || []);
//                 setUpdatedAt(res.data.updated_at || null);
//             }
//         } catch (err) {
//             console.error("Failed to fetch AI recipes", err);
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         fetchRecipes();
//     }, [lang]);

//     // Generate New AI Recipes
//     const handleGenerate = async () => {
//         setGenerating(true);
//         try {
//             await axios.post("/api/ai-recipes/generate", { lang });

//             // Polling until updated
//             const start = Date.now();
//             const timeout = 30 * 1000;
//             const delay = (ms) => new Promise((r) => setTimeout(r, ms));
//             let attempt = 0;

//             while (Date.now() - start < timeout && attempt < 10) {
//                 attempt++;
//                 await delay(2000);
//                 const res = await axios.get("/api/ai-recipes");

//                 if (res.data && res.data.updated_at !== updatedAt) {
//                     setRecipes(res.data.recipes || []);
//                     setUpdatedAt(res.data.updated_at || null);
//                     break;
//                 }
//             }
//         } catch (err) {
//             console.error("Generate error", err);
//         } finally {
//             setGenerating(false);
//         }
//     };

//     return (
//         <section className="px-6 md:px-12 py-16 bg-gradient-to-b from-gray-900 to-gray-800">
//             <div className="max-w-7xl mx-auto">
//                 {/* HEADER */}
//                 <div className="flex items-center justify-between mb-10">
//                     <h2 className="text-3xl font-bold text-white">
//                         {lang === "ar"
//                             ? "وصفات مولدة بالذكاء الاصطناعي"
//                             : "AI-Generated Recipes"}
//                     </h2>

//                     <div className="flex items-center gap-4">
//                         <span className="text-gray-400 text-sm">
//                             {updatedAt
//                                 ? lang === "ar"
//                                     ? `آخر تحديث: ${new Date(
//                                           updatedAt
//                                       ).toLocaleString()}`
//                                     : `Updated: ${new Date(
//                                           updatedAt
//                                       ).toLocaleString()}`
//                                 : lang === "ar"
//                                 ? "توليد كل 3 أيام"
//                                 : "Auto-generated every 3 days"}
//                         </span>

//                         <button
//                             onClick={handleGenerate}
//                             disabled={generating}
//                             className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-xl shadow transition disabled:opacity-60"
//                         >
//                             {generating
//                                 ? lang === "ar"
//                                     ? "جاري التوليد..."
//                                     : "Generating…"
//                                 : lang === "ar"
//                                 ? "توليد جديد"
//                                 : "Generate Now"}
//                         </button>
//                     </div>
//                 </div>

//                 {/* RECIPES GRID */}
//                 {loading ? (
//                     <div className="text-center text-gray-400 py-12">
//                         {lang === "ar" ? "جاري التحميل..." : "Loading..."}
//                     </div>
//                 ) : recipes.length === 0 ? (
//                     <div className="text-center text-gray-400 py-12">
//                         {lang === "ar"
//                             ? "لا توجد وصفات بعد"
//                             : "No recipes found"}
//                     </div>
//                 ) : (
//                     <div className="grid md:grid-cols-4 gap-6">
//                         {recipes.map((r) => (
//                             <article
//                                 key={r.id}
//                                 className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl overflow-hidden shadow-lg border border-gray-700 group hover:scale-105 transition"
//                             >
//                                 <img
//                                     src={r.image}
//                                     alt={r.title}
//                                     className="w-full h-40 object-cover"
//                                 />

//                                 <div className="p-4">
//                                     <h3 className="text-lg font-semibold text-white mb-1">
//                                         {r.title}
//                                     </h3>

//                                     <p className="text-sm text-gray-300 mb-3 line-clamp-2">
//                                         {r.desc}
//                                     </p>

//                                     <div className="flex items-center justify-between">
//                                         <span className="text-green-400 font-semibold">
//                                             ⏱ {r.time}
//                                         </span>

//                                         <button
//                                             onClick={() => setShow(r)}
//                                             className="px-3 py-1 bg-green-600 hover:bg-green-500 text-white rounded-lg"
//                                         >
//                                             {lang === "ar" ? "عرض" : "View"}
//                                         </button>
//                                     </div>
//                                 </div>
//                             </article>
//                         ))}
//                     </div>
//                 )}
//             </div>

//             {/* POPUP */}
//             {show && (
//                 <RecipeModal
//                     meal={{
//                         title: show.title,
//                         image: show.image,
//                         desc: show.desc,
//                         ingredients: show.ingredients || [],
//                         steps: show.steps ? show.steps.split("\n") : [],
//                     }}
//                     onClose={() => setShow(null)}
//                 />
//             )}
//         </section>
//     );
// }
