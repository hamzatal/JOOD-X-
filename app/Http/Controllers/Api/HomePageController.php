<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class HomePageController extends Controller
{
    /**
     * جلب الوصفات الشهرية والتريند
     */
    public function getTrendingRecipes(Request $request)
    {
        $lang = $request->query('lang', 'en');
        $refresh = $request->query('refresh', 'false') === 'true';

        $cacheKey = "trending_recipes_{$lang}";

        Log::info("Trending recipes request", ['lang' => $lang, 'refresh' => $refresh]);

        // إذا كان refresh=true، حذف الـ cache
        if ($refresh) {
            Cache::forget($cacheKey);
            Log::info("Cache cleared for: {$cacheKey}");
        }

        try {
            // جلب من الـ cache (مدته ساعة)، أو إذا لم يكن موجوداً جلب من البيانات
            $recipes = Cache::remember($cacheKey, 3600, function () use ($lang) {
                Log::info("Fetching trending recipes from API for language: {$lang}");
                return $this->fetchArabicRecipes($lang);
            });

            if (empty($recipes)) {
                Log::warning("No recipes returned");
                return response()->json(['recipes' => [], 'message' => 'No recipes available'], 200);
            }

            Log::info("Successfully returned recipes", ['count' => count($recipes), 'lang' => $lang]);
            return response()->json(['recipes' => $recipes], 200);
        } catch (\Exception $e) {
            Log::error("Error fetching trending recipes: " . $e->getMessage(), [
                'exception' => $e,
                'line' => $e->getLine(),
                'file' => $e->getFile()
            ]);

            // إرجاع وصفات افتراضية في حالة الفشل
            return response()->json([
                'recipes' => $this->getFallbackRecipes($lang),
                'error' => config('app.debug') ? $e->getMessage() : 'Failed to fetch recipes'
            ], 200);
        }
    }

    /**
     * جلب الوصفات العشوائية
     */
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
                return $this->fetchRandomRecipesFromAPI($lang);
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

    /**
     * جلب الوصفات العربية من OpenAI
     */
    private function fetchArabicRecipes($lang)
    {
        $openaiKey = env('OPENAI_API_KEY');

        if (!$openaiKey) {
            Log::error("OpenAI API Key is missing!");
            throw new \Exception("OpenAI API Key not configured");
        }

        $prompt = $lang === 'ar'
            ? "أعطني 10 وصفات عربية أصيلة شهيرة وتريند حالياً (مثل: المقلوبة، المنسف، الكبسة، المندي، الملوخية، الفتة، الكبة، الشاورما، الفلافل، الحمص). أعِد JSON فقط بدون أي markdown أو نص إضافي. الصيغة: [
            {\"idMeal\":\"1\",\"strMeal\":\"اسم الوصفة بالعربي\",\"strMealAr\":\"اسم الوصفة بالعربي\",\"strCategory\":\"نوع الطبخ\",\"strCategoryAr\":\"نوع الطبخ\",\"strArea\":\"المنطقة\",\"strAreaAr\":\"المنطقة\",\"strInstructions\":\"خطوات التحضير بالعربي\",\"strInstructionsAr\":\"خطوات التحضير بالعربي\",\"strMealThumb\":\"https://www.themealdb.com/images/media/meals/123.jpg\",\"ingredients\":[\"مكون 1\",\"مكون 2\"]}
            ]"
            : "Give me 10 popular trending international recipes. Return ONLY valid JSON (no markdown, no extra text). Format: [
            {\"idMeal\":\"1\",\"strMeal\":\"Recipe name\",\"strCategory\":\"Category\",\"strArea\":\"Country\",\"strInstructions\":\"Cooking instructions\",\"strMealThumb\":\"https://www.themealdb.com/images/media/meals/123.jpg\",\"ingredients\":[\"ing 1\",\"ing 2\"]}
            ]";

        try {
            Log::info("Calling OpenAI API for language: {$lang}");

            $response = Http::timeout(30)
                ->retry(2, 1000)
                ->withToken($openaiKey)
                ->post('https://api.openai.com/v1/chat/completions', [
                    'model' => 'gpt-4o-mini',
                    'messages' => [
                        [
                            'role' => 'system',
                            'content' => 'You are a professional chef expert. Return ONLY valid JSON array format. No markdown code blocks, no extra text, no explanations.'
                        ],
                        [
                            'role' => 'user',
                            'content' => $prompt
                        ]
                    ],
                    'max_tokens' => 2000,
                    'temperature' => 0.7
                ]);

            Log::info("OpenAI response status: " . $response->status());

            if ($response->failed()) {
                Log::error("OpenAI API failed", [
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);
                throw new \Exception("OpenAI API error: " . $response->status());
            }

            $content = $response->json('choices.0.message.content');

            if (!$content) {
                Log::error("Empty content from OpenAI");
                throw new \Exception("Empty response from OpenAI");
            }

            Log::info("Raw OpenAI response length: " . strlen($content));

            $recipes = $this->parseJSON($content);

            if (empty($recipes)) {
                Log::warning("No recipes parsed from OpenAI response");
                throw new \Exception("Failed to parse recipes from OpenAI response");
            }

            Log::info("Successfully parsed recipes count: " . count($recipes));

            // جلب الصور
            foreach ($recipes as &$recipe) {
                if (empty($recipe['strMealThumb'])) {
                    $query = $recipe['strMeal'] ?? 'food';
                    $recipe['strMealThumb'] = $this->fetchRecipeImage($query);
                }

                if (empty($recipe['idMeal'])) {
                    $recipe['idMeal'] = uniqid();
                }
            }

            return $recipes;
        } catch (\Exception $e) {
            Log::error("Error in fetchArabicRecipes: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * جلب وصفات عشوائية من TheMealDB (سريع جداً)
     */
    private function fetchRandomRecipesFromAPI($lang)
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
                            // إذا كانت اللغة عربية، أضف ترجمات
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
            Log::error("Error in fetchRandomRecipesFromAPI: " . $e->getMessage());
            return $this->getFallbackRecipes($lang);
        }
    }

    /**
     * جلب صورة الطبق
     */
    private function fetchRecipeImage($query)
    {
        try {
            $cacheKey = "image_" . md5($query);

            return Cache::remember($cacheKey, 86400, function () use ($query) {
                // جرب Pexels أولاً (سريع وموثوق)
                $image = $this->getPexelsImage($query);
                if ($image) return $image;

                // ثم Unsplash
                $image = $this->getUnsplashImage($query);
                if ($image) return $image;

                // صورة افتراضية
                return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop';
            });
        } catch (\Exception $e) {
            Log::warning("Error fetching image for: {$query}");
            return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop';
        }
    }

    private function getPexelsImage($query)
    {
        $key = env('PEXELS_API_KEY');
        if (!$key) return null;

        try {
            $response = Http::timeout(5)
                ->withHeaders(['Authorization' => $key])
                ->get('https://api.pexels.com/v1/search', [
                    'query' => $query,
                    'per_page' => 1
                ]);

            return $response->json('photos.0.src.large') ?? null;
        } catch (\Exception $e) {
            Log::warning("Pexels error: " . $e->getMessage());
            return null;
        }
    }

    private function getUnsplashImage($query)
    {
        $key = env('UNSPLASH_ACCESS_KEY');
        if (!$key) return null;

        try {
            $response = Http::timeout(5)
                ->get('https://api.unsplash.com/search/photos', [
                    'query' => $query,
                    'client_id' => $key,
                    'per_page' => 1
                ]);

            return $response->json('results.0.urls.regular') ?? null;
        } catch (\Exception $e) {
            Log::warning("Unsplash error: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Parse JSON من نص قد يحتوي على markdown
     */
    private function parseJSON($text)
    {
        // إزالة markdown code blocks
        $text = preg_replace('/``````/i', '', $text);
        $text = preg_replace('/``````/i', '', $text);
        $text = trim($text);

        // حاول decode مباشرة
        $decoded = json_decode($text, true);
        if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
            return $decoded;
        }

        // حاول استخراج array من النص
        if (preg_match('/\[[\s\S]*\]/s', $text, $matches)) {
            $decoded = json_decode($matches[0], true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                return $decoded;
            }
        }

        Log::error("Failed to parse JSON", ['text' => substr($text, 0, 500)]);
        return null;
    }

    /**
     * وصفات افتراضية (backup) من TheMealDB
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
