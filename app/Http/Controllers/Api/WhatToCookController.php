<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class WhatToCookController extends Controller
{
    public function generate(Request $request)
    {
        try {
            $openai = env("OPENAI_API_KEY");
            if (!$openai) {
                Log::error("OpenAI API Key missing");
                return response()->json(["error" => "Missing API Key"], 500);
            }

            $ingredients = $request->ingredients ?? "";
            $mood = $request->mood ?? "quick";
            $difficulty = $request->difficulty ?? "easy";
            $time = $request->time ?? "30";
            $cuisine = $request->cuisine ?? "all";
            $dietary = $request->dietary ?? "none";
            $servings = $request->servings ?? "4";
            $lang = $request->lang === "ar" ? "ar" : "en";

            Log::info("Recipe request", [
                "ingredients" => $ingredients,
                "cuisine" => $cuisine,
                "lang" => $lang
            ]);

            $cuisineText = $this->getCuisineText($cuisine, $lang);
            $dietaryText = $this->getDietaryText($dietary, $lang);
            $cuisineFocus = $this->getCuisineFocus($cuisine, $lang);

            // Build dynamic prompt based on cuisine selection
            $prompt = $lang === "ar"
                ? "أعطني 4 وصفات {$cuisineText} يمكن تحضيرها باستخدام: {$ingredients}. الحالة: {$mood}، الوقت: {$time} دقيقة، الصعوبة: {$difficulty}، عدد الأشخاص: {$servings}، النظام الغذائي: {$dietaryText}. {$cuisineFocus} أعِد JSON فقط بهذا الشكل: [{\"title\":\"اسم الوصفة\",\"description\":\"وصف شهي\",\"ingredients\":[\"مكون 1\",\"مكون 2\"],\"instructions\":\"خطوات مرقمة\",\"prepTime\":\"15\",\"cookTime\":\"30\",\"calories\":\"400\",\"protein\":\"20g\",\"cuisine\":\"نوع المطبخ\",\"tags\":[\"صحي\"],\"tips\":\"نصيحة\",\"image_query\":\"dish name in English for accurate image search\"}]"
                : "Give me 4 {$cuisineText} recipes using: {$ingredients}. Mood: {$mood}, Time: {$time} min, Difficulty: {$difficulty}, Servings: {$servings}, Dietary: {$dietaryText}. {$cuisineFocus} Return ONLY JSON: [{\"title\":\"Recipe name\",\"description\":\"Description\",\"ingredients\":[\"ing 1\",\"ing 2\"],\"instructions\":\"Numbered steps\",\"prepTime\":\"15\",\"cookTime\":\"30\",\"calories\":\"400\",\"protein\":\"20g\",\"cuisine\":\"Cuisine type\",\"tags\":[\"healthy\"],\"tips\":\"Tip\",\"image_query\":\"dish name in English for accurate image search\"}]";

            // Call OpenAI
            Log::info("Calling OpenAI...");
            
            $response = Http::timeout(60)
                ->retry(2, 2000)
                ->withToken($openai)
                ->post("https://api.openai.com/v1/chat/completions", [
                    "model" => "gpt-4o-mini",
                    "messages" => [
                        [
                            "role" => "system",
                            "content" => "You are a professional chef. Return ONLY valid JSON array. No markdown, no extra text. Respect the cuisine type requested by the user."
                        ],
                        [
                            "role" => "user",
                            "content" => $prompt
                        ]
                    ],
                    "max_tokens" => 1800,
                    "temperature" => 0.75
                ]);

            if ($response->failed()) {
                Log::error("OpenAI failed", ["status" => $response->status()]);
                return response()->json(["error" => "Failed to generate recipes"], 500);
            }

            $raw = $response->json("choices.0.message.content");
            
            if (!$raw) {
                Log::error("Empty OpenAI response");
                return response()->json(["recipes" => []]);
            }

            // Extract JSON
            $json = $this->extractJson($raw);
            
            if (!$json || !is_array($json) || empty($json)) {
                Log::error("Failed to parse JSON", ["raw" => substr($raw, 0, 300)]);
                return response()->json(["recipes" => []]);
            }

            Log::info("Recipes parsed", ["count" => count($json)]);

            // Attach accurate images
            foreach ($json as &$r) {
                // Use the image_query from AI (English dish name)
                $imageQuery = $r["image_query"] ?? $r["title"] ?? "food";
                
                // Clean and prepare query
                $cleanQuery = $this->prepareImageQuery($imageQuery, $cuisine);
                
                Log::info("Fetching image", ["query" => $cleanQuery]);
                
                // Try all 3 APIs with the best query
                $img = $this->fetchBestImage($cleanQuery);
                
                $r["image"] = $img;
                $r["prepTime"] = $r["prepTime"] ?? "15";
                $r["cookTime"] = $r["cookTime"] ?? "30";
                $r["calories"] = $r["calories"] ?? "400";
                $r["protein"] = $r["protein"] ?? "20g";
                $r["cuisine"] = $r["cuisine"] ?? $cuisineText;
                $r["tags"] = $r["tags"] ?? [];
                $r["tips"] = $r["tips"] ?? "";
            }

            Log::info("Recipes ready with images");

            return response()->json(["recipes" => $json]);

        } catch (\Exception $e) {
            Log::error("Controller exception", [
                "message" => $e->getMessage(),
                "line" => $e->getLine()
            ]);
            
            return response()->json([
                "error" => "Server error",
                "message" => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    // Get cuisine text for prompt
    private function getCuisineText($cuisine, $lang)
    {
        $cuisines = [
            "arabic" => ["ar" => "عربية أصيلة", "en" => "authentic Arabic"],
            "levantine" => ["ar" => "شامية", "en" => "Levantine"],
            "gulf" => ["ar" => "خليجية", "en" => "Gulf"],
            "mediterranean" => ["ar" => "متوسطية", "en" => "Mediterranean"],
            "asian" => ["ar" => "آسيوية", "en" => "Asian"],
            "italian" => ["ar" => "إيطالية", "en" => "Italian"],
            "all" => ["ar" => "متنوعة", "en" => "diverse"],
        ];
        return $cuisines[$cuisine][$lang] ?? "";
    }

    // Get cuisine focus instruction
    private function getCuisineFocus($cuisine, $lang)
    {
        if ($cuisine === "all") {
            return $lang === "ar" 
                ? "ركّز على الطبخات العربية الأصيلة مع تنويع من مطابخ أخرى."
                : "Focus primarily on authentic Arabic dishes with some diversity from other cuisines.";
        }

        $focus = [
            "arabic" => [
                "ar" => "ركّز فقط على الطبخات العربية الأصيلة (مثل: المقلوبة، المنسف، الكبسة، المندي، الملوخية، الفتة، الكبة).",
                "en" => "Focus ONLY on authentic Arabic dishes (like: Maqluba, Mansaf, Kabsa, Mandi, Molokhia, Fattah, Kibbeh)."
            ],
            "levantine" => [
                "ar" => "ركّز فقط على الطبخات الشامية (سورية، لبنانية، فلسطينية، أردنية).",
                "en" => "Focus ONLY on Levantine dishes (Syrian, Lebanese, Palestinian, Jordanian)."
            ],
            "gulf" => [
                "ar" => "ركّز فقط على الطبخات الخليجية (سعودية، إماراتية، كويتية، قطرية).",
                "en" => "Focus ONLY on Gulf dishes (Saudi, Emirati, Kuwaiti, Qatari)."
            ],
            "mediterranean" => [
                "ar" => "ركّز فقط على الطبخات المتوسطية (يونانية، تركية، إيطالية متوسطية).",
                "en" => "Focus ONLY on Mediterranean dishes (Greek, Turkish, Mediterranean Italian)."
            ],
            "asian" => [
                "ar" => "ركّز فقط على الطبخات الآسيوية (صينية، يابانية، تايلندية، هندية).",
                "en" => "Focus ONLY on Asian dishes (Chinese, Japanese, Thai, Indian)."
            ],
            "italian" => [
                "ar" => "ركّز فقط على الطبخات الإيطالية الأصيلة (باستا، بيتزا، ريزوتو، لازانيا).",
                "en" => "Focus ONLY on authentic Italian dishes (Pasta, Pizza, Risotto, Lasagna)."
            ],
        ];

        return $focus[$cuisine][$lang] ?? "";
    }

    private function getDietaryText($dietary, $lang)
    {
        $diets = [
            "vegetarian" => ["ar" => "نباتي", "en" => "vegetarian"],
            "vegan" => ["ar" => "نباتي صرف", "en" => "vegan"],
            "keto" => ["ar" => "كيتو", "en" => "keto"],
            "lowcarb" => ["ar" => "قليل الكربوهيدرات", "en" => "low-carb"],
            "none" => ["ar" => "لا يوجد", "en" => "none"],
        ];
        return $diets[$dietary][$lang] ?? "";
    }

    // Prepare optimized image query
    private function prepareImageQuery($query, $cuisine)
    {
        // Remove Arabic characters and clean
        $query = preg_replace('/[\x{0600}-\x{06FF}]/u', '', $query);
        $query = trim($query);
        
        // Add cuisine context for better results
        $cuisineMap = [
            "arabic" => "arabic food",
            "levantine" => "levantine food",
            "gulf" => "gulf arabic food",
            "mediterranean" => "mediterranean food",
            "asian" => "asian cuisine",
            "italian" => "italian food",
        ];
        
        $suffix = $cuisineMap[$cuisine] ?? "food dish";
        
        // Clean and combine
        $cleanQuery = strtolower($query);
        $cleanQuery = preg_replace('/[^a-z0-9\s]/', '', $cleanQuery);
        $cleanQuery = trim($cleanQuery) . " " . $suffix;
        
        return $cleanQuery;
    }

    // Fetch best image from all 3 APIs
    private function fetchBestImage($query)
    {
        // Try Spoonacular first (best for food)
        $img = $this->fetchFromSpoonacular($query);
        if ($img) {
            Log::info("Image from Spoonacular");
            return $img;
        }

        // Try Pexels second
        $img = $this->fetchFromPexels($query);
        if ($img) {
            Log::info("Image from Pexels");
            return $img;
        }

        // Try Unsplash third
        $img = $this->fetchFromUnsplash($query);
        if ($img) {
            Log::info("Image from Unsplash");
            return $img;
        }

        Log::warning("Using fallback image for: " . $query);
        return "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop";
    }

    private function extractJson($text)
    {
        // Remove markdown code blocks using chr()
        $backtick = chr(96); // backtick character
        $text = str_replace($backtick . $backtick . $backtick . "json", "", $text);
        $text = str_replace($backtick . $backtick . $backtick, "", $text);
        $text = trim($text);

        // Try direct decode
        $decoded = json_decode($text, true);
        if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
            return $decoded;
        }

        // Extract array
        if (preg_match('/\[[\s\S]*\]/s', $text, $m)) {
            $decoded = json_decode($m[0], true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                return $decoded;
            }
        }

        return null;
    }


    // SPOONACULAR - Best for food images
    private function fetchFromSpoonacular($query)
    {
        $key = env("SPOONACULAR_API_KEY");
        if (!$key) return null;

        try {
            $cacheKey = "spoon_" . md5($query);
            
            return Cache::remember($cacheKey, 7200, function () use ($key, $query) {
                $res = Http::timeout(8)->get("https://api.spoonacular.com/recipes/complexSearch", [
                    "apiKey" => $key,
                    "query" => $query,
                    "number" => 3,
                    "addRecipeInformation" => true,
                ]);

                if ($res->failed()) return null;

                $results = $res->json("results");
                if (!$results || empty($results)) return null;

                // Get first recipe image
                return $results[0]["image"] ?? null;
            });
        } catch (\Exception $e) {
            Log::warning("Spoonacular error: " . $e->getMessage());
            return null;
        }
    }

    // PEXELS
    private function fetchFromPexels($query)
    {
        $key = env("PEXELS_API_KEY");
        if (!$key) return null;

        try {
            $cacheKey = "pexels_" . md5($query);
            
            return Cache::remember($cacheKey, 3600, function () use ($key, $query) {
                $res = Http::timeout(5)
                    ->withHeaders(["Authorization" => $key])
                    ->get("https://api.pexels.com/v1/search", [
                        "query" => $query,
                        "per_page" => 1,
                        "orientation" => "landscape"
                    ]);

                if ($res->failed()) return null;

                $photos = $res->json("photos");
                if (!$photos || empty($photos)) return null;

                return $photos[0]["src"]["large"] ?? null;
            });
        } catch (\Exception $e) {
            Log::warning("Pexels error: " . $e->getMessage());
            return null;
        }
    }

    // UNSPLASH
    private function fetchFromUnsplash($query)
    {
        $key = env("UNSPLASH_ACCESS_KEY");
        if (!$key) return null;

        try {
            $cacheKey = "unsplash_" . md5($query);
            
            return Cache::remember($cacheKey, 3600, function () use ($key, $query) {
                $res = Http::timeout(5)
                    ->get("https://api.unsplash.com/search/photos", [
                        "query" => $query,
                        "client_id" => $key,
                        "per_page" => 1,
                        "orientation" => "landscape"
                    ]);

                if ($res->failed()) return null;

                $results = $res->json("results");
                if (!$results || empty($results)) return null;

                return $results[0]["urls"]["regular"] ?? null;
            });
        } catch (\Exception $e) {
            Log::warning("Unsplash error: " . $e->getMessage());
            return null;
        }
    }
}
