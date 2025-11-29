<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Client\Pool;

class HomePageController extends Controller
{
    /**
     * جلب الوصفات الشهيرية والتريند (محسّن - بدون Cache Tags)
     */
    public function getTrendingRecipes(Request $request)
    {
        $lang = $request->query('lang', 'en');
        $refresh = $request->query('refresh', 'false') === 'true';

        $cacheKey = "trending_recipes_{$lang}";

        Log::info("Trending recipes request", ['lang' => $lang, 'refresh' => $refresh]);

        // حذف الـ cache إذا كان refresh=true
        if ($refresh) {
            Cache::forget($cacheKey);
            Log::info("Cache cleared for: {$cacheKey}");
        }

        try {
            // استخدام Cache بدون Tags (يعمل مع file driver)
            $recipes = Cache::remember($cacheKey, 3600, function () use ($lang) {
                Log::info("Fetching trending recipes from API for language: {$lang}");
                
                // استخدام TheMealDB كمصدر رئيسي (أسرع بكثير)
                $recipes = $this->fetchTrendingFromMealDB($lang);
                
                // إذا فشل، استخدم OpenAI (بطيء لكن غني بالمحتوى العربي)
                if (empty($recipes)) {
                    Log::info("TheMealDB returned empty, trying OpenAI");
                    $recipes = $this->fetchArabicRecipes($lang);
                }
                
                return $recipes;
            });

            if (empty($recipes)) {
                Log::warning("No recipes returned");
                return response()->json([
                    'recipes' => $this->getFallbackRecipes($lang), 
                    'message' => 'Using fallback recipes'
                ], 200);
            }

            Log::info("Successfully returned recipes", ['count' => count($recipes), 'lang' => $lang]);
            return response()->json(['recipes' => $recipes], 200);

        } catch (\Exception $e) {
            Log::error("Error fetching trending recipes: " . $e->getMessage(), [
                'exception' => $e,
                'line' => $e->getLine(),
                'file' => $e->getFile(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'recipes' => $this->getFallbackRecipes($lang),
                'error' => config('app.debug') ? $e->getMessage() : 'Failed to fetch recipes'
            ], 200);
        }
    }

    /**
     * جلب الوصفات العشوائية (محسّن بـ Http::pool)
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
                Log::info("Fetching random recipes using Http::pool");
                return $this->fetchRandomRecipesFromAPI($lang);
            });

            return response()->json(['recipes' => $recipes], 200);

        } catch (\Exception $e) {
            Log::error("Error fetching random recipes: " . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'recipes' => $this->getFallbackRecipes($lang),
                'error' => config('app.debug') ? $e->getMessage() : 'Failed to fetch recipes'
            ], 200);
        }
    }

    /**
     * جلب وصفات تريند من TheMealDB (سريع جداً)
     */
    private function fetchTrendingFromMealDB($lang)
    {
        try {
            Log::info("Starting fetchTrendingFromMealDB");
            
            // الفئات الشهيرة
            $categories = ['Beef', 'Chicken', 'Dessert', 'Lamb', 'Pasta', 'Seafood', 'Vegetarian'];
            
            $recipes = [];
            
            // جلب متزامن باستخدام Http::pool
            $responses = Http::pool(fn (Pool $pool) => 
                collect($categories)->take(5)->map(fn($cat) => 
                    $pool->timeout(8)->get("https://www.themealdb.com/api/json/v1/1/filter.php?c={$cat}")
                )->toArray()
            );

            Log::info("Pool responses received", ['count' => count($responses)]);

            // معالجة النتائج
            foreach ($responses as $index => $response) {
                if ($response->successful()) {
                    $meals = $response->json('meals', []);
                    
                    if (!empty($meals) && is_array($meals)) {
                        // أخذ وصفتين عشوائيتين من كل فئة
                        $count = min(2, count($meals));
                        $selectedMeals = collect($meals)->random($count)->toArray();
                        $recipes = array_merge($recipes, $selectedMeals);
                    }
                } else {
                    Log::warning("Category request failed", ['index' => $index]);
                }
            }

            // جلب التفاصيل الكاملة للوصفات
            if (!empty($recipes)) {
                Log::info("Fetching full details for recipes", ['count' => count($recipes)]);
                $recipes = $this->fetchFullRecipeDetails(array_slice($recipes, 0, 10), $lang);
            }

            Log::info("Trending recipes fetched successfully", ['count' => count($recipes)]);
            return $recipes;

        } catch (\Exception $e) {
            Log::error("Error in fetchTrendingFromMealDB: " . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return [];
        }
    }

    /**
     * جلب التفاصيل الكاملة للوصفات بشكل متزامن
     */
    private function fetchFullRecipeDetails(array $basicRecipes, $lang)
    {
        try {
            $ids = collect($basicRecipes)->pluck('idMeal')->filter()->toArray();
            
            if (empty($ids)) {
                return [];
            }

            Log::info("Fetching details for IDs", ['ids' => $ids]);
            
            // جلب جميع التفاصيل بشكل متزامن
            $responses = Http::pool(fn (Pool $pool) => 
                collect($ids)->map(fn($id) => 
                    $pool->timeout(8)->get("https://www.themealdb.com/api/json/v1/1/lookup.php?i={$id}")
                )->toArray()
            );

            $fullRecipes = [];

            foreach ($responses as $response) {
                if ($response->successful()) {
                    $meal = $response->json('meals.0');
                    
                    if ($meal) {
                        // إضافة الحقول العربية إذا كانت اللغة عربية
                        if ($lang === 'ar') {
                            $meal = $this->addArabicTranslations($meal);
                        }
                        
                        // استخراج المكونات
                        $meal['ingredients'] = $this->extractIngredients($meal);
                        
                        $fullRecipes[] = $meal;
                    }
                }
            }

            Log::info("Full recipes fetched", ['count' => count($fullRecipes)]);
            return $fullRecipes;

        } catch (\Exception $e) {
            Log::error("Error fetching full recipe details: " . $e->getMessage());
            return $basicRecipes; // إرجاع الوصفات الأساسية في حالة الفشل
        }
    }

    /**
     * جلب الوصفات العشوائية باستخدام Http::pool (محسّن)
     */
    private function fetchRandomRecipesFromAPI($lang)
    {
        try {
            Log::info("Fetching 10 random recipes concurrently");

            // جلب 10 وصفات عشوائية بشكل متزامن
            $responses = Http::pool(fn (Pool $pool) => 
                collect(range(1, 10))->map(fn() => 
                    $pool->timeout(8)->get('https://www.themealdb.com/api/json/v1/1/random.php')
                )->toArray()
            );

            $recipes = [];

            foreach ($responses as $index => $response) {
                if ($response->successful()) {
                    $meal = $response->json('meals.0');
                    
                    if ($meal) {
                        // إضافة ترجمات عربية
                        if ($lang === 'ar') {
                            $meal = $this->addArabicTranslations($meal);
                        }
                        
                        // استخراج المكونات
                        $meal['ingredients'] = $this->extractIngredients($meal);
                        
                        $recipes[] = $meal;
                    }
                } else {
                    Log::warning("Random recipe #{$index} failed");
                }
            }

            if (empty($recipes)) {
                Log::warning("No random recipes fetched");
                return $this->getFallbackRecipes($lang);
            }

            Log::info("Successfully fetched random recipes", ['count' => count($recipes)]);
            return $recipes;

        } catch (\Exception $e) {
            Log::error("Error in fetchRandomRecipesFromAPI: " . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return $this->getFallbackRecipes($lang);
        }
    }

    /**
     * جلب الوصفات العربية من OpenAI (محسّن)
     */
    private function fetchArabicRecipes($lang)
    {
        $openaiKey = env('OPENAI_API_KEY');

        if (!$openaiKey) {
            Log::warning("OpenAI API Key is missing - skipping OpenAI recipes");
            return [];
        }

        // تحسين الـ Prompt
        $prompt = $lang === 'ar'
            ? "قائمة JSON فقط بـ 10 وصفات عربية شهيرة. بدون markdown. الصيغة:
            [{\"idMeal\":\"1\",\"strMeal\":\"المقلوبة\",\"strMealThumb\":\"https://www.themealdb.com/images/media/meals/llcbn01574260722.jpg\",\"strCategory\":\"رئيسي\",\"strArea\":\"فلسطيني\",\"strInstructions\":\"خطوات مختصرة\",\"ingredients\":[\"أرز\",\"دجاج\"]}]"
            : "JSON only: 10 popular recipes. No markdown. Format:
            [{\"idMeal\":\"1\",\"strMeal\":\"Pasta\",\"strMealThumb\":\"https://example.com/img.jpg\",\"strCategory\":\"Pasta\",\"strArea\":\"Italian\",\"strInstructions\":\"steps\",\"ingredients\":[\"pasta\",\"sauce\"]}]";

        try {
            Log::info("Calling OpenAI API for language: {$lang}");

            $response = Http::timeout(25)
                ->retry(2, 1000)
                ->withToken($openaiKey)
                ->post('https://api.openai.com/v1/chat/completions', [
                    'model' => 'gpt-4o-mini',
                    'messages' => [
                        [
                            'role' => 'system',
                            'content' => 'Return ONLY valid JSON array. No markdown, no explanations.'
                        ],
                        [
                            'role' => 'user',
                            'content' => $prompt
                        ]
                    ],
                    'max_tokens' => 1500,
                    'temperature' => 0.5
                ]);

            if ($response->failed()) {
                Log::error("OpenAI API failed", ['status' => $response->status()]);
                return [];
            }

            $content = $response->json('choices.0.message.content');

            if (!$content) {
                Log::error("Empty content from OpenAI");
                return [];
            }

            $recipes = $this->parseJSON($content);

            if (empty($recipes)) {
                Log::warning("No recipes parsed from OpenAI");
                return [];
            }

            Log::info("OpenAI recipes parsed", ['count' => count($recipes)]);

            // جلب الصور فقط للوصفات بدون صور
            foreach ($recipes as &$recipe) {
                if (empty($recipe['strMealThumb']) || !filter_var($recipe['strMealThumb'], FILTER_VALIDATE_URL)) {
                    $recipe['strMealThumb'] = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop';
                }
                
                if (empty($recipe['idMeal'])) {
                    $recipe['idMeal'] = uniqid('recipe_');
                }
            }

            return $recipes;

        } catch (\Exception $e) {
            Log::error("Error in fetchArabicRecipes: " . $e->getMessage());
            return [];
        }
    }

    /**
     * استخراج المكونات من الوصفة
     */
    private function extractIngredients($meal)
    {
        $ingredients = [];
        
        for ($i = 1; $i <= 20; $i++) {
            $ingredient = $meal["strIngredient{$i}"] ?? null;
            $measure = $meal["strMeasure{$i}"] ?? null;
            
            if (!empty($ingredient) && trim($ingredient) !== '') {
                $ingredients[] = trim($measure . ' ' . $ingredient);
            }
        }
        
        return $ingredients;
    }

    /**
     * إضافة ترجمات عربية
     */
    private function addArabicTranslations($meal)
    {
        $translations = [
            'Beef' => 'لحم بقر',
            'Chicken' => 'دجاج',
            'Dessert' => 'حلويات',
            'Lamb' => 'لحم خروف',
            'Pasta' => 'معكرونة',
            'Seafood' => 'مأكولات بحرية',
            'Vegetarian' => 'نباتي',
            'Breakfast' => 'فطور',
            'Side' => 'طبق جانبي',
            'Starter' => 'مقبلات',
            'Vegan' => 'نباتي صارم',
            'Pork' => 'لحم خنزير' // لن نستخدمه لكن للترجمة فقط
        ];

        $meal['strMealAr'] = $meal['strMeal'] ?? '';
        $meal['strCategoryAr'] = $translations[$meal['strCategory'] ?? ''] ?? ($meal['strCategory'] ?? '');
        $meal['strAreaAr'] = $meal['strArea'] ?? '';
        $meal['strInstructionsAr'] = $meal['strInstructions'] ?? '';

        return $meal;
    }

    /**
     * Parse JSON من نص
     */
    private function parseJSON($text)
    {
        // إزالة markdown
        $text = preg_replace('/```/i', '', $text);
        $text = preg_replace('/```\s*/i', '', $text);
        $text = trim($text);

        // محاولة decode
        $decoded = json_decode($text, true);
        if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
            return $decoded;
        }

        // استخراج array
        if (preg_match('/\[[\s\S]*\]/s', $text, $matches)) {
            $decoded = json_decode($matches[0], true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                return $decoded;
            }
        }

        Log::error("Failed to parse JSON");
        return [];
    }

    /**
     * وصفات احتياطية
     */
    private function getFallbackRecipes($lang)
    {
        try {
            Log::info("Loading fallback recipes");

            $responses = Http::pool(fn (Pool $pool) => 
                collect(range(1, 6))->map(fn() => 
                    $pool->timeout(5)->get('https://www.themealdb.com/api/json/v1/1/random.php')
                )->toArray()
            );

            $fallbackRecipes = [];

            foreach ($responses as $response) {
                if ($response->successful()) {
                    $meal = $response->json('meals.0');

                    if ($meal) {
                        if ($lang === 'ar') {
                            $meal = $this->addArabicTranslations($meal);
                        }
                        
                        $meal['ingredients'] = $this->extractIngredients($meal);
                        $fallbackRecipes[] = $meal;
                    }
                }
            }

            Log::info("Fallback recipes loaded", ['count' => count($fallbackRecipes)]);
            return $fallbackRecipes;

        } catch (\Exception $e) {
            Log::error("Fallback failed: " . $e->getMessage());
            return [];
        }
    }

    /**
     * حذف الـ cache
     */
    public function clearCache(Request $request)
    {
        try {
            $lang = $request->query('lang');
            
            if ($lang) {
                // حذف لغة معينة
                Cache::forget("trending_recipes_{$lang}");
                Cache::forget("random_recipes_{$lang}");
                Log::info("Cache cleared for language: {$lang}");
            } else {
                // حذف كل شيء
                Cache::forget('trending_recipes_ar');
                Cache::forget('trending_recipes_en');
                Cache::forget('random_recipes_ar');
                Cache::forget('random_recipes_en');
                Log::info("All recipes cache cleared");
            }
            
            return response()->json(['message' => 'Cache cleared successfully'], 200);
        } catch (\Exception $e) {
            Log::error("Error clearing cache: " . $e->getMessage());
            return response()->json(['error' => 'Failed to clear cache'], 500);
        }
    }
}
