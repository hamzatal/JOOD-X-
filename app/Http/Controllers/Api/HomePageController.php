<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class HomePageController extends Controller
{

    public function getTrendingRecipes(Request $request)
    {
        $lang = $request->query('lang', 'en');
        $refresh = $request->query('refresh', 'false') === 'true';

        $cacheKey = "trending_recipes_{$lang}";

        Log::info("Trending recipes request", ['lang' => $lang, 'refresh' => $refresh]);

        if ($refresh) {
            Cache::forget($cacheKey);
            Log::info("Cache cleared for: {$cacheKey}");
        }

        try {
            $recipes = Cache::remember($cacheKey, 3600, function () use ($lang) {
                Log::info("Fetching trending recipes from OpenAI for language: {$lang}");
                return $this->fetchTrendingFromOpenAI($lang);
            });

            if (empty($recipes)) {
                Log::warning("No recipes returned");
                return response()->json(['recipes' => []], 200);
            }

            // تحويل البيانات لصيغة المطلوبة (strMeal بدل title)
            $recipes = $this->transformToMealFormat($recipes);

            Log::info("Successfully returned recipes", ['count' => count($recipes), 'lang' => $lang]);
            return response()->json(['recipes' => $recipes], 200);
        } catch (\Exception $e) {
            Log::error("Error fetching trending recipes: " . $e->getMessage(), [
                'exception' => $e,
                'line' => $e->getLine()
            ]);

            return response()->json([
                'recipes' => $this->getFallbackRecipes($lang),
                'error' => config('app.debug') ? $e->getMessage() : 'Failed to fetch recipes'
            ], 200);
        }
    }

    public function getRandomRecipes(Request $request)
    {
        $lang = $request->query('lang', 'en');
        $refresh = $request->query('refresh', 'false') === 'true';

        $cacheKey = "random_recipes_{$lang}";

        Log::info("Random recipes request", ['lang' => $lang, 'refresh' => $refresh]);

        if ($refresh) {
            Cache::forget($cacheKey);
        }

        try {
            $recipes = Cache::remember($cacheKey, 1800, function () use ($lang) {
                Log::info("Fetching random recipes from TheMealDB");
                return $this->fetchRandomRecipesFromTheMealDB($lang);
            });

            return response()->json(['recipes' => $recipes], 200);
        } catch (\Exception $e) {
            Log::error("Error fetching random recipes: " . $e->getMessage());

            return response()->json([
                'recipes' => $this->getFallbackRecipes($lang),
                'error' => config('app.debug') ? $e->getMessage() : 'Failed to fetch recipes'
            ], 200);
        }
    }


    private function fetchTrendingFromOpenAI($lang)
    {
        $openaiKey = env('OPENAI_API_KEY');

        if (!$openaiKey) {
            Log::error("OpenAI API Key is missing!");
            throw new \Exception("OpenAI API Key not configured");
        }

        $prompt = $lang === 'ar'
            ? "أعطني 10 وصفات عربية أصيلة وشهيرة وتريند حالياً (مثل: المقلوبة، المنسف، الكبسة، المندي، الملوخية، الفتة، الكبة، الشاورما، الفلافل، الحمص). 
            أعِد JSON فقط بهذا الشكل بدون أي markdown: [
            {\"strMeal\":\"اسم الوصفة بالعربي\",\"strCategory\":\"نوع الطبخ\",\"strArea\":\"المنطقة\",\"strInstructions\":\"خطوات التحضير بالعربي مفصلة وواضحة\",\"ingredients\":[\"مكون 1\",\"مكون 2\"],\"prepTime\":\"15\",\"cookTime\":\"30\",\"calories\":\"400\",\"protein\":\"20g\",\"image_query\":\"اسم الطبق بالإنجليزي للبحث الدقيق عن الصورة\"}
            ]"
            : "Give me 10 popular trending international recipes. Return ONLY JSON (no markdown): [
            {\"strMeal\":\"Recipe name\",\"strCategory\":\"Category\",\"strArea\":\"Country\",\"strInstructions\":\"Detailed cooking instructions\",\"ingredients\":[\"ing 1\",\"ing 2\"],\"prepTime\":\"15\",\"cookTime\":\"30\",\"calories\":\"400\",\"protein\":\"20g\",\"image_query\":\"dish name in English for accurate image search\"}
            ]";

        try {
            Log::info("Calling OpenAI for trending recipes in language: {$lang}");

            $response = Http::timeout(30)
                ->retry(2, 1000)
                ->withToken($openaiKey)
                ->post('https://api.openai.com/v1/chat/completions', [
                    'model' => 'gpt-4o-mini',
                    'messages' => [
                        [
                            'role' => 'system',
                            'content' => 'You are a professional chef. Return ONLY valid JSON array. No markdown, no extra text. Respect the cuisine type requested by the user.'
                        ],
                        [
                            'role' => 'user',
                            'content' => $prompt
                        ]
                    ],
                    'max_tokens' => 2000,
                    'temperature' => 0.75
                ]);

            Log::info("OpenAI response status: " . $response->status());

            if ($response->failed()) {
                Log::error("OpenAI API failed", [
                    'status' => $response->status(),
                    'body' => substr($response->body(), 0, 300)
                ]);
                throw new \Exception("OpenAI API error: " . $response->status());
            }

            $content = $response->json('choices.0.message.content');

            if (!$content) {
                Log::error("Empty content from OpenAI");
                throw new \Exception("Empty response from OpenAI");
            }

            Log::info("Raw OpenAI response length: " . strlen($content));

            $recipes = $this->extractJson($content);

            if (empty($recipes)) {
                Log::warning("No recipes parsed from OpenAI response");
                throw new \Exception("Failed to parse recipes from OpenAI response");
            }

            Log::info("Successfully parsed recipes count: " . count($recipes));

            foreach ($recipes as &$recipe) {
                $imageQuery = $recipe['image_query'] ?? $recipe['strMeal'] ?? 'food';
                $cleanQuery = $this->prepareImageQuery($imageQuery, 'all');

                Log::info("Fetching image", ["query" => $cleanQuery]);

                $recipe['strMealThumb'] = $this->fetchBestImage($cleanQuery);

                if (empty($recipe['idMeal'])) {
                    $recipe['idMeal'] = uniqid();
                }
            }

            return $recipes;
        } catch (\Exception $e) {
            Log::error("Error in fetchTrendingFromOpenAI: " . $e->getMessage());
            throw $e;
        }
    }


    private function fetchRandomRecipesFromTheMealDB($lang)
    {
        $randomRecipes = [];

        try {
            for ($i = 0; $i < 8; $i++) {
                try {
                    Log::info("Fetching random meal #{$i}");

                    $response = Http::timeout(8)
                        ->get('https://www.themealdb.com/api/json/v1/1/random.php');

                    if ($response->successful()) {
                        $meal = $response->json('meals.0');

                        if ($meal) {
                            // إذا كانت اللغة عربية، أضف تسميات عربية
                            if ($lang === 'ar') {
                                $meal['strMealAr'] = $meal['strMeal'] ?? '';
                                $meal['strCategoryAr'] = $meal['strCategory'] ?? '';
                                $meal['strAreaAr'] = $meal['strArea'] ?? '';
                                $meal['strInstructionsAr'] = $meal['strInstructions'] ?? '';
                            }

                            $randomRecipes[] = $meal;
                        }
                    }
                } catch (\Exception $e) {
                    Log::warning("Failed to fetch random meal #{$i}: " . $e->getMessage());
                    continue;
                }
            }

            if (empty($randomRecipes)) {
                Log::warning("No random recipes fetched");
                return $this->getFallbackRecipes($lang);
            }

            Log::info("Successfully fetched " . count($randomRecipes) . " random recipes");
            return $randomRecipes;
        } catch (\Exception $e) {
            Log::error("Error in fetchRandomRecipesFromTheMealDB: " . $e->getMessage());
            return $this->getFallbackRecipes($lang);
        }
    }

    /**
     * تحويل الوصفات من صيغة OpenAI إلى صيغة TheMealDB
     */
    private function transformToMealFormat($recipes)
    {
        return array_map(function ($recipe) {
            return [
                'idMeal' => $recipe['idMeal'] ?? uniqid(),
                'strMeal' => $recipe['strMeal'] ?? $recipe['title'] ?? 'Recipe',
                'strMealAr' => $recipe['strMeal'] ?? $recipe['title'] ?? 'Recipe',
                'strCategory' => $recipe['strCategory'] ?? 'General',
                'strCategoryAr' => $recipe['strCategory'] ?? 'عام',
                'strArea' => $recipe['strArea'] ?? 'General',
                'strAreaAr' => $recipe['strArea'] ?? 'عام',
                'strInstructions' => $recipe['strInstructions'] ?? $recipe['instructions'] ?? '',
                'strInstructionsAr' => $recipe['strInstructions'] ?? $recipe['instructions'] ?? '',
                'strMealThumb' => $recipe['strMealThumb'] ?? $recipe['image'] ?? '',
                'ingredients' => $recipe['ingredients'] ?? [],
                'prepTime' => $recipe['prepTime'] ?? '15',
                'cookTime' => $recipe['cookTime'] ?? '30',
                'calories' => $recipe['calories'] ?? '400',
                'protein' => $recipe['protein'] ?? '20g'
            ];
        }, $recipes);
    }

    /**
     * جلب أفضل صورة من 3 APIs (نفس منطق WhatToCookController)
     */
    private function fetchBestImage($query)
    {
        // جرب Spoonacular أولاً (متخصص في الطعام)
        $img = $this->fetchFromSpoonacular($query);
        if ($img) {
            Log::info("Image from Spoonacular");
            return $img;
        }

        // ثم Pexels
        $img = $this->fetchFromPexels($query);
        if ($img) {
            Log::info("Image from Pexels");
            return $img;
        }

        // ثم Unsplash
        $img = $this->fetchFromUnsplash($query);
        if ($img) {
            Log::info("Image from Unsplash");
            return $img;
        }

        Log::warning("Using fallback image for: " . $query);
        return "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop";
    }

    /**
     * Spoonacular - متخصص في صور الطعام
     */
    private function fetchFromSpoonacular($query)
    {
        $key = env("SPOONACULAR_API_KEY");
        if (!$key) return null;

        try {
            $cacheKey = "spoon_" . md5($query);

            return Cache::remember($cacheKey, 86400, function () use ($key, $query) {
                $res = Http::timeout(8)->get("https://api.spoonacular.com/recipes/complexSearch", [
                    "apiKey" => $key,
                    "query" => $query,
                    "number" => 3,
                    "addRecipeInformation" => true,
                ]);

                if ($res->failed()) return null;

                $results = $res->json("results");
                if (!$results || empty($results)) return null;

                return $results[0]["image"] ?? null;
            });
        } catch (\Exception $e) {
            Log::warning("Spoonacular error: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Pexels - صور عالية الجودة
     */
    private function fetchFromPexels($query)
    {
        $key = env("PEXELS_API_KEY");
        if (!$key) return null;

        try {
            $cacheKey = "pexels_" . md5($query);

            return Cache::remember($cacheKey, 86400, function () use ($key, $query) {
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

    /**
     * Unsplash - احتياطي
     */
    private function fetchFromUnsplash($query)
    {
        $key = env("UNSPLASH_ACCESS_KEY");
        if (!$key) return null;

        try {
            $cacheKey = "unsplash_" . md5($query);

            return Cache::remember($cacheKey, 86400, function () use ($key, $query) {
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

    /**
     * تنظيف وتحضير query البحث عن الصورة
     */
    private function prepareImageQuery($query, $cuisine)
    {
        // إزالة الأحرف العربية
        $query = preg_replace('/[\x{0600}-\x{06FF}]/u', '', $query);
        $query = trim($query);

        // تنظيف الـ query
        $cleanQuery = strtolower($query);
        $cleanQuery = preg_replace('/[^a-z0-9\s]/', '', $cleanQuery);
        $cleanQuery = trim($cleanQuery);

        return !empty($cleanQuery) ? $cleanQuery : "food dish";
    }

    /**
     * استخراج JSON من نص قد يحتوي على markdown
     * (نفس الدالة من WhatToCookController)
     */
    private function extractJson($text)
    {
        // إزالة markdown code blocks
        $backtick = chr(96); // backtick character
        $text = str_replace($backtick . $backtick . $backtick . "json", "", $text);
        $text = str_replace($backtick . $backtick . $backtick, "", $text);
        $text = trim($text);

        // محاولة decode مباشرة
        $decoded = json_decode($text, true);
        if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
            return $decoded;
        }

        // محاولة استخراج array من النص
        if (preg_match('/\[[\s\S]*\]/s', $text, $m)) {
            $decoded = json_decode($m[0], true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                return $decoded;
            }
        }

        Log::error("Failed to parse JSON", ['text' => substr($text, 0, 500)]);
        return null;
    }

    /**
     * وصفات احتياطية من TheMealDB
     */
    private function getFallbackRecipes($lang)
    {
        try {
            Log::info("Loading fallback recipes");
            $fallbackRecipes = [];

            for ($i = 0; $i < 5; $i++) {
                $response = Http::timeout(5)
                    ->get('https://www.themealdb.com/api/json/v1/1/random.php');

                if ($response->successful()) {
                    $meal = $response->json('meals.0');

                    if ($meal) {
                        if ($lang === 'ar') {
                            $meal['strMealAr'] = $meal['strMeal'] ?? '';
                            $meal['strCategoryAr'] = $meal['strCategory'] ?? '';
                            $meal['strAreaAr'] = $meal['strArea'] ?? '';
                            $meal['strInstructionsAr'] = $meal['strInstructions'] ?? '';
                        }

                        $fallbackRecipes[] = $meal;
                    }
                }
            }

            return !empty($fallbackRecipes) ? $fallbackRecipes : [];
        } catch (\Exception $e) {
            Log::error("Fallback recipe fetch failed: " . $e->getMessage());
            return [];
        }
    }
}
