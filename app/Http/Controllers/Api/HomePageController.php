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
     * جلب الوصفات حسب اللغة
     */
    public function getTrendingRecipes(Request $request)
    {
        $lang = $request->query('lang', 'en');
        $refresh = $request->query('refresh', 'false') === 'true';

        $cacheKey = "trending_halal_recipes_{$lang}";

        Log::info("Trending recipes request", ['lang' => $lang, 'refresh' => $refresh]);

        if ($refresh) {
            Cache::forget($cacheKey);
        }

        try {
            $recipes = Cache::remember($cacheKey, 3600, function () use ($lang) {
                if ($lang === 'ar') {
                    // جلب وصفات عربية من TheMealDB + ترجمة فورية
                    return $this->fetchRealArabicRecipes();
                } else {
                    // وصفات عالمية
                    return $this->fetchInternationalRecipes();
                }
            });

            if (empty($recipes)) {
                $recipes = $this->getFallbackRecipes($lang);
            }

            return response()->json(['recipes' => $recipes], 200);
        } catch (\Exception $e) {
            Log::error("Error: " . $e->getMessage());
            return response()->json([
                'recipes' => $this->getFallbackRecipes($lang),
                'error' => config('app.debug') ? $e->getMessage() : 'Failed to fetch recipes'
            ], 200);
        }
    }

    /**
     * جلب وصفات عربية حقيقية من TheMealDB (Egyptian, Moroccan, Turkish, Tunisian)
     * مع ترجمة فورية للعربية باستخدام OpenAI
     */
    private function fetchRealArabicRecipes()
    {
        try {
            Log::info("Fetching real Arabic recipes from TheMealDB");

            // المناطق العربية والشرق أوسطية في TheMealDB
            $arabicAreas = ['Egyptian', 'Moroccan', 'Turkish', 'Tunisian'];

            $allRecipes = [];

            // جلب جميع الوصفات من المناطق العربية
            $responses = Http::pool(
                fn(Pool $pool) =>
                collect($arabicAreas)->map(
                    fn($area) =>
                    $pool->timeout(6)->get("https://www.themealdb.com/api/json/v1/1/filter.php?a={$area}")
                )->toArray()
            );

            foreach ($responses as $response) {
                if ($response->successful()) {
                    $meals = $response->json('meals', []);
                    if (!empty($meals)) {
                        $allRecipes = array_merge($allRecipes, $meals);
                    }
                }
            }

            if (empty($allRecipes)) {
                Log::warning("No Arabic recipes found");
                return [];
            }

            // اختيار 12 وصفة عشوائية
            $selectedRecipes = collect($allRecipes)
                ->shuffle()
                ->take(12)
                ->toArray();

            // جلب التفاصيل الكاملة مع الترجمة
            $fullRecipes = $this->fetchFullRecipeDetailsWithTranslation($selectedRecipes);

            Log::info("Real Arabic recipes fetched", ['count' => count($fullRecipes)]);
            return $fullRecipes;
        } catch (\Exception $e) {
            Log::error("Error fetching Arabic recipes: " . $e->getMessage());
            return [];
        }
    }

    /**
     * جلب التفاصيل الكاملة مع ترجمة فورية
     */
    private function fetchFullRecipeDetailsWithTranslation(array $basicRecipes)
    {
        try {
            $ids = collect($basicRecipes)->pluck('idMeal')->filter()->toArray();

            if (empty($ids)) {
                return [];
            }

            Log::info("Fetching full details for recipes", ['count' => count($ids)]);

            // جلب التفاصيل بشكل متزامن
            $responses = Http::pool(
                fn(Pool $pool) =>
                collect($ids)->map(
                    fn($id) =>
                    $pool->timeout(6)->get("https://www.themealdb.com/api/json/v1/1/lookup.php?i={$id}")
                )->toArray()
            );

            $finalRecipes = [];

            foreach ($responses as $response) {
                if ($response->successful()) {
                    $meal = $response->json('meals.0');

                    if ($meal && $this->isHalal($meal)) {
                        // استخراج المكونات
                        $meal['ingredients'] = $this->extractIngredients($meal);

                        // ترجمة فورية باستخدام OpenAI
                        $meal = $this->translateMealToArabicRealTime($meal);

                        $finalRecipes[] = $meal;

                        if (count($finalRecipes) >= 10) {
                            break;
                        }
                    }
                }
            }

            return $finalRecipes;
        } catch (\Exception $e) {
            Log::error("Error: " . $e->getMessage());
            return [];
        }
    }

    /**
     * ترجمة فورية للوصفة باستخدام OpenAI (مع Cache ذكي)
     */
    private function translateMealToArabicRealTime($meal)
    {
        $openaiKey = env('OPENAI_API_KEY');

        // الترجمات الأساسية (بدون OpenAI)
        $meal['strCategoryAr'] = $this->translateBasic($meal['strCategory'], 'category');
        $meal['strAreaAr'] = $this->translateBasic($meal['strArea'], 'area');

        if (!$openaiKey) {
            Log::warning("OpenAI missing - using basic translations");
            $meal['strMealAr'] = $meal['strMeal'];
            $meal['strInstructionsAr'] = $meal['strInstructions'];
            return $meal;
        }

        try {
            // ترجمة الاسم فقط (سريع)
            $cacheKey = "meal_name_ar_" . md5($meal['strMeal']);

            $translatedName = Cache::remember($cacheKey, 86400, function () use ($meal, $openaiKey) {
                Log::info("Translating meal name", ['name' => $meal['strMeal']]);

                $response = Http::timeout(8)
                    ->withToken($openaiKey)
                    ->post('https://api.openai.com/v1/chat/completions', [
                        'model' => 'gpt-4o-mini',
                        'messages' => [
                            [
                                'role' => 'system',
                                'content' => 'أنت مترجم متخصص في أسماء الأطباق. ترجم اسم الطبق للعربية بدقة. أعطِ الترجمة فقط بدون أي نص إضافي.'
                            ],
                            [
                                'role' => 'user',
                                'content' => "ترجم اسم الطبق للعربية: {$meal['strMeal']}"
                            ]
                        ],
                        'max_tokens' => 30,
                        'temperature' => 0.3
                    ]);

                if ($response->successful()) {
                    return trim($response->json('choices.0.message.content'));
                }

                return null;
            });

            $meal['strMealAr'] = $translatedName ?? $meal['strMeal'];

            // ترجمة الخطوات (مختصرة - أول 300 حرف فقط)
            $shortInstructions = mb_substr($meal['strInstructions'], 0, 300);
            $instructionsCacheKey = "instructions_ar_" . md5($shortInstructions);

            $translatedInstructions = Cache::remember($instructionsCacheKey, 86400, function () use ($shortInstructions, $openaiKey) {
                $response = Http::timeout(10)
                    ->withToken($openaiKey)
                    ->post('https://api.openai.com/v1/chat/completions', [
                        'model' => 'gpt-4o-mini',
                        'messages' => [
                            [
                                'role' => 'system',
                                'content' => 'ترجم خطوات الطبخ للعربية بشكل واضح ومختصر.'
                            ],
                            [
                                'role' => 'user',
                                'content' => "ترجم للعربية:\n\n{$shortInstructions}"
                            ]
                        ],
                        'max_tokens' => 400,
                        'temperature' => 0.3
                    ]);

                if ($response->successful()) {
                    return trim($response->json('choices.0.message.content'));
                }

                return null;
            });

            $meal['strInstructionsAr'] = $translatedInstructions ?? $meal['strInstructions'];

            Log::info("Translation successful", [
                'original' => $meal['strMeal'],
                'translated' => $meal['strMealAr']
            ]);
        } catch (\Exception $e) {
            Log::error("Translation error: " . $e->getMessage());
            $meal['strMealAr'] = $meal['strMeal'];
            $meal['strInstructionsAr'] = $meal['strInstructions'];
        }

        return $meal;
    }

    /**
     * ترجمات أساسية (بدون OpenAI)
     */
    private function translateBasic($text, $type)
    {
        $translations = [
            'category' => [
                'Beef' => 'لحم بقر',
                'Chicken' => 'دجاج',
                'Dessert' => 'حلويات',
                'Lamb' => 'لحم خروف',
                'Pasta' => 'معكرونة',
                'Seafood' => 'مأكولات بحرية',
                'Vegetarian' => 'نباتي',
                'Vegan' => 'نباتي صارم',
                'Breakfast' => 'فطور',
                'Side' => 'طبق جانبي',
                'Starter' => 'مقبلات',
                'Miscellaneous' => 'متنوع'
            ],
            'area' => [
                'Egyptian' => 'مصري',
                'Moroccan' => 'مغربي',
                'Turkish' => 'تركي',
                'Tunisian' => 'تونسي',
                'Lebanese' => 'لبناني',
                'American' => 'أمريكي',
                'British' => 'بريطاني',
                'Chinese' => 'صيني',
                'French' => 'فرنسي',
                'Indian' => 'هندي',
                'Italian' => 'إيطالي',
                'Japanese' => 'ياباني',
                'Mexican' => 'مكسيكي',
                'Spanish' => 'إسباني',
                'Thai' => 'تايلندي'
            ]
        ];

        return $translations[$type][$text] ?? $text;
    }

    /**
     * جلب وصفات عالمية (إنجليزي)
     */
    private function fetchInternationalRecipes()
    {
        try {
            Log::info("Fetching international recipes");

            $categories = ['Beef', 'Chicken', 'Seafood', 'Pasta', 'Dessert', 'Vegetarian'];

            $allRecipes = [];

            $responses = Http::pool(
                fn(Pool $pool) =>
                collect($categories)->map(
                    fn($cat) =>
                    $pool->timeout(6)->get("https://www.themealdb.com/api/json/v1/1/filter.php?c={$cat}")
                )->toArray()
            );

            foreach ($responses as $response) {
                if ($response->successful()) {
                    $meals = $response->json('meals', []);
                    if (!empty($meals)) {
                        $allRecipes = array_merge($allRecipes, $meals);
                    }
                }
            }

            if (empty($allRecipes)) {
                return [];
            }

            $selectedRecipes = collect($allRecipes)
                ->shuffle()
                ->take(10)
                ->toArray();

            return $this->fetchFullRecipeDetailsEnglish($selectedRecipes);
        } catch (\Exception $e) {
            Log::error("Error: " . $e->getMessage());
            return [];
        }
    }

    /**
     * جلب التفاصيل (إنجليزي)
     */
    private function fetchFullRecipeDetailsEnglish(array $basicRecipes)
    {
        try {
            $ids = collect($basicRecipes)->pluck('idMeal')->filter()->toArray();

            if (empty($ids)) {
                return [];
            }

            $responses = Http::pool(
                fn(Pool $pool) =>
                collect($ids)->map(
                    fn($id) =>
                    $pool->timeout(6)->get("https://www.themealdb.com/api/json/v1/1/lookup.php?i={$id}")
                )->toArray()
            );

            $finalRecipes = [];

            foreach ($responses as $response) {
                if ($response->successful()) {
                    $meal = $response->json('meals.0');

                    if ($meal && $this->isHalal($meal)) {
                        $meal['ingredients'] = $this->extractIngredients($meal);
                        $finalRecipes[] = $meal;

                        if (count($finalRecipes) >= 10) {
                            break;
                        }
                    }
                }
            }

            return $finalRecipes;
        } catch (\Exception $e) {
            Log::error("Error: " . $e->getMessage());
            return [];
        }
    }

    /**
     * فحص الحلال
     */
    private function isHalal($meal)
    {
        $forbidden = [
            'pork',
            'bacon',
            'ham',
            'lard',
            'pancetta',
            'prosciutto',
            'wine',
            'beer',
            'alcohol',
            'rum',
            'vodka',
            'whiskey',
            'sake',
            'liqueur',
            'sherry',
            'brandy'
        ];

        $mealText = strtolower(json_encode($meal));

        foreach ($forbidden as $word) {
            if (strpos($mealText, $word) !== false) {
                return false;
            }
        }

        return true;
    }

    /**
     * استخراج المكونات
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
     * وصفات احتياطية
     */
    private function getFallbackRecipes($lang)
    {
        try {
            $responses = Http::pool(
                fn(Pool $pool) =>
                collect(range(1, 12))->map(
                    fn() =>
                    $pool->timeout(5)->get('https://www.themealdb.com/api/json/v1/1/random.php')
                )->toArray()
            );

            $recipes = [];

            foreach ($responses as $response) {
                if ($response->successful()) {
                    $meal = $response->json('meals.0');

                    if ($meal && $this->isHalal($meal)) {
                        $meal['ingredients'] = $this->extractIngredients($meal);

                        if ($lang === 'ar') {
                            $meal = $this->translateMealToArabicRealTime($meal);
                        }

                        $recipes[] = $meal;

                        if (count($recipes) >= 8) {
                            break;
                        }
                    }
                }
            }

            return $recipes;
        } catch (\Exception $e) {
            Log::error("Fallback failed: " . $e->getMessage());
            return [];
        }
    }

    /**
     * حذف Cache
     */
    public function clearCache(Request $request)
    {
        try {
            Cache::forget('trending_halal_recipes_ar');
            Cache::forget('trending_halal_recipes_en');

            return response()->json(['message' => 'Cache cleared'], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed'], 500);
        }
    }
}
