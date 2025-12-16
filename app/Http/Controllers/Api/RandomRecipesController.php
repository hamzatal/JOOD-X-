<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;
use Illuminate\Http\Client\Pool;

class RandomRecipesController extends Controller
{
    private const ARABIC_AREAS = ['Egyptian', 'Moroccan', 'Turkish', 'Tunisian'];
    private const RECIPES_COUNT = 8; // ✅ 8 وصفات فقط

    public function index(Request $request)
    {
        set_time_limit(300); // 5 دقائق

        try {
            $lang = $request->get('lang', 'en');
            $refresh = $request->get('refresh', 'false');

            $cacheKey = "random_halal_meals_v3_{$lang}";

            Log::info("Random recipes request", ['lang' => $lang, 'refresh' => $refresh]);

            if ($refresh === 'true') {
                Cache::forget($cacheKey);
            }

            $recipes = Cache::remember($cacheKey, 21600, function () use ($lang) {
                if ($lang === 'ar') {
                    return $this->fetchArabicRecipes();
                }
                return $this->fetchHalalRecipes();
            });

            Log::info("Returning recipes", ['count' => count($recipes), 'lang' => $lang]);

            return response()->json(['recipes' => $recipes]);
        } catch (\Exception $e) {
            Log::error("Error: " . $e->getMessage());

            return response()->json([
                'error' => 'Failed to fetch recipes',
                'recipes' => []
            ], 500);
        }
    }

    private function fetchArabicRecipes()
    {
        try {
            Log::info("Fetching Arabic recipes");

            $allArabicMeals = [];

            $responses = Http::pool(
                fn(Pool $pool) => collect(self::ARABIC_AREAS)->map(
                    fn($area) => $pool->timeout(6)->get(
                        "https://www.themealdb.com/api/json/v1/1/filter.php?a={$area}"
                    )
                )->toArray()
            );

            foreach ($responses as $index => $response) {
                if ($response->successful()) {
                    $meals = $response->json('meals', []);
                    if ($meals) {
                        $allArabicMeals = array_merge($allArabicMeals, $meals);
                    }
                }
            }

            if (empty($allArabicMeals)) {
                Log::warning("No Arabic meals, using fallback");
                return $this->fetchHalalRecipes();
            }

            $selectedIds = collect($allArabicMeals)
                ->shuffle()
                ->take(12)
                ->pluck('idMeal')
                ->toArray();

            $detailedRecipes = $this->fetchMealDetails($selectedIds);

            $halalRecipes = array_filter($detailedRecipes, fn($m) => $this->isHalal($m));

            $finalRecipes = array_slice($halalRecipes, 0, self::RECIPES_COUNT);

            foreach ($finalRecipes as &$recipe) {
                $recipe = $this->translateRecipeQuick($recipe);
            }

            Log::info("Arabic recipes ready", ['count' => count($finalRecipes)]);

            return array_values($finalRecipes);
        } catch (\Exception $e) {
            Log::error("Arabic fetch error: " . $e->getMessage());
            return $this->fetchHalalRecipes();
        }
    }

    private function fetchMealDetails(array $mealIds)
    {
        $meals = [];
        $chunks = array_chunk($mealIds, 8);

        foreach ($chunks as $chunk) {
            try {
                $responses = Http::pool(
                    fn(Pool $pool) => collect($chunk)->map(
                        fn($id) => $pool->timeout(5)->get(
                            "https://www.themealdb.com/api/json/v1/1/lookup.php?i={$id}"
                        )
                    )->toArray()
                );

                foreach ($responses as $response) {
                    if ($response->successful()) {
                        $meal = $response->json('meals.0');
                        if ($meal) {
                            $meal['ingredients'] = $this->extractIngredients($meal);
                            $meals[] = $meal;
                        }
                    }
                }
            } catch (\Exception $e) {
                Log::warning("Batch fetch failed");
            }
        }

        return $meals;
    }


    private function translateRecipeQuick($meal)
    {
        $apiKey = env('OPENAI_API_KEY');

        // إذا في OpenAI، استخدمه للترجمة الكاملة
        if ($apiKey) {
            return $this->translateRecipeWithOpenAI($meal, $apiKey);
        }

        // ترجمة بسيطة بدون OpenAI
        $meal['strMealAr'] = $this->translateNameQuick($meal['strMeal']);
        $meal['strCategoryAr'] = $this->translateCategory($meal['strCategory'] ?? '');
        $meal['strAreaAr'] = $this->translateArea($meal['strArea'] ?? '');
        $meal['strInstructionsAr'] = $meal['strInstructions'] ?? '';

        for ($i = 1; $i <= 20; $i++) {
            $ing = $meal["strIngredient{$i}"] ?? null;
            if ($ing && trim($ing)) {
                $meal["strIngredient{$i}Ar"] = $this->translateIngredientQuick($ing);
            }
        }

        $meal['categoryAr'] = $meal['strCategoryAr'];
        $meal['areaAr'] = $meal['strAreaAr'];

        return $meal;
    }

    /**
     * ترجمة كاملة مع OpenAI
     */
    private function translateRecipeWithOpenAI($meal, $apiKey)
    {
        $cacheKey = "full_recipe_trans_" . $meal['idMeal'];

        try {
            $translated = Cache::remember($cacheKey, 604800, function () use ($meal, $apiKey) {
                // ترجمة الاسم
                $nameAr = $this->quickTranslateText($meal['strMeal'], 'name', $apiKey);

                // ترجمة التعليمات
                $instructionsAr = '';
                if (!empty($meal['strInstructions'])) {
                    $instructionsAr = $this->quickTranslateText(
                        $meal['strInstructions'],
                        'instructions',
                        $apiKey
                    );
                }

                return [
                    'nameAr' => $nameAr,
                    'instructionsAr' => $instructionsAr
                ];
            });

            $meal['strMealAr'] = $translated['nameAr'];
            $meal['strInstructionsAr'] = $translated['instructionsAr'];
        } catch (\Exception $e) {
            Log::warning("OpenAI translation failed");
            $meal['strMealAr'] = $this->translateNameQuick($meal['strMeal']);
            $meal['strInstructionsAr'] = $meal['strInstructions'];
        }

        // ترجمة المكونات
        for ($i = 1; $i <= 20; $i++) {
            $ing = $meal["strIngredient{$i}"] ?? null;
            if ($ing && trim($ing)) {
                $meal["strIngredient{$i}Ar"] = $this->translateIngredientWithCache($ing, $apiKey);
            }
        }

        $meal['strCategoryAr'] = $this->translateCategory($meal['strCategory'] ?? '');
        $meal['strAreaAr'] = $this->translateArea($meal['strArea'] ?? '');
        $meal['categoryAr'] = $meal['strCategoryAr'];
        $meal['areaAr'] = $meal['strAreaAr'];

        return $meal;
    }

    /**
     * ترجمة سريعة مع OpenAI (timeout قصير)
     */
    private function quickTranslateText($text, $type, $apiKey)
    {
        try {
            $systemPrompt = match ($type) {
                'name' => 'ترجم اسم الطبق للعربية. اسم واحد فقط.',
                'instructions' => 'ترجم خطوات التحضير للعربية بوضوح.',
                default => 'ترجم للعربية'
            };

            $maxTokens = match ($type) {
                'name' => 30,
                'instructions' => 1500,
                default => 100
            };

            $response = Http::timeout(10) // timeout قصير
                ->withToken($apiKey)
                ->post('https://api.openai.com/v1/chat/completions', [
                    'model' => 'gpt-4o-mini',
                    'messages' => [
                        ['role' => 'system', 'content' => $systemPrompt],
                        ['role' => 'user', 'content' => $text]
                    ],
                    'max_tokens' => $maxTokens,
                    'temperature' => 0.2
                ]);

            if ($response->successful()) {
                return trim($response->json('choices.0.message.content', $text));
            }
        } catch (\Exception $e) {
            // silent fail
        }

        return $text;
    }

    /**
     * ترجمة مكون مع cache
     */
    private function translateIngredientWithCache($ingredient, $apiKey)
    {
        // قاموس سريع أولاً
        $dict = [
            'chickpeas' => 'حمص',
            'chicken' => 'دجاج',
            'beef' => 'لحم بقر',
            'lamb' => 'لحم خروف',
            'rice' => 'أرز',
            'onion' => 'بصل',
            'garlic' => 'ثوم',
            'garlic clove' => 'فص ثوم',
            'salt' => 'ملح',
            'pepper' => 'فلفل',
            'oil' => 'زيت',
            'vegetable oil' => 'زيت نباتي',
            'olive oil' => 'زيت زيتون',
            'tomato' => 'طماطم',
            'potato' => 'بطاطس',
            'carrot' => 'جزر',
            'egg' => 'بيض',
            'milk' => 'حليب',
            'butter' => 'زبدة',
            'unsalted butter' => 'زبدة غير مملحة',
            'cheese' => 'جبن',
            'flour' => 'طحين',
            'sugar' => 'سكر',
            'water' => 'ماء',
            'lemon' => 'ليمون',
            'lemon juice' => 'عصير ليمون',
            'cumin' => 'كمون',
            'coriander' => 'كزبرة',
            'parsley' => 'بقدونس',
            'mint' => 'نعناع',
            'cinnamon' => 'قرفة',
            'ginger' => 'زنجبيل',
            'turmeric' => 'كركم',
            'paprika' => 'فلفل حلو',
            'tahini' => 'طحينة',
            'tahini paste' => 'طحينة',
            'greek yogurt' => 'لبن يوناني',
            'yogurt' => 'لبن',
            'vermicelli' => 'شعيرية',
            'vermicelli pasta' => 'شعيرية',
            'chicken stock' => 'مرق دجاج',
            'stock' => 'مرق',
        ];

        $lower = strtolower(trim($ingredient));

        if (isset($dict[$lower])) {
            return $dict[$lower];
        }

        // استخدام OpenAI للمكونات غير الموجودة
        $cacheKey = "ing_trans_" . md5($lower);

        return Cache::remember($cacheKey, 604800, function () use ($ingredient, $apiKey) {
            try {
                $response = Http::timeout(8)
                    ->withToken($apiKey)
                    ->post('https://api.openai.com/v1/chat/completions', [
                        'model' => 'gpt-4o-mini',
                        'messages' => [
                            ['role' => 'system', 'content' => 'ترجم اسم المكون للعربية. كلمة واحدة فقط.'],
                            ['role' => 'user', 'content' => $ingredient]
                        ],
                        'max_tokens' => 20,
                        'temperature' => 0.2
                    ]);

                if ($response->successful()) {
                    return trim($response->json('choices.0.message.content', $ingredient));
                }
            } catch (\Exception $e) {
                // silent
            }

            return $ingredient;
        });
    }

    private function translateIngredientQuick($ingredient)
    {
        $dict = [
            'chickpeas' => 'حمص',
            'chicken' => 'دجاج',
            'beef' => 'لحم بقر',
            'lamb' => 'لحم خروف',
            'rice' => 'أرز',
            'onion' => 'بصل',
            'garlic' => 'ثوم',
            'garlic clove' => 'فص ثوم',
            'salt' => 'ملح',
            'pepper' => 'فلفل',
            'oil' => 'زيت',
            'vegetable oil' => 'زيت نباتي',
            'olive oil' => 'زيت زيتون',
            'tomato' => 'طماطم',
            'potato' => 'بطاطس',
            'carrot' => 'جزر',
            'egg' => 'بيض',
            'milk' => 'حليب',
            'butter' => 'زبدة',
            'unsalted butter' => 'زبدة غير مملحة',
            'cheese' => 'جبن',
            'flour' => 'طحين',
            'sugar' => 'سكر',
            'water' => 'ماء',
            'lemon' => 'ليمون',
            'lemon juice' => 'عصير ليمون',
            'tahini' => 'طحينة',
            'tahini paste' => 'طحينة',
            'greek yogurt' => 'لبن يوناني',
            'yogurt' => 'لبن',
            'vermicelli' => 'شعيرية',
            'vermicelli pasta' => 'شعيرية',
            'chicken stock' => 'مرق دجاج',
        ];

        $lower = strtolower(trim($ingredient));
        return $dict[$lower] ?? $ingredient;
    }


    private function translateNameQuick($name)
    {
        $commonNames = [
            'Koshari' => 'كشري',
            'Ful Medames' => 'فول مدمس',
            'Falafel' => 'فلافل',
            'Couscous' => 'كسكس',
            'Tagine' => 'طاجين',
            'Kebab' => 'كباب',
            'Hummus' => 'حمص',
            'Tabbouleh' => 'تبولة',
            'Baklava' => 'بقلاوة',
            'Shawarma' => 'شاورما',
        ];

        // بحث في القاموس
        foreach ($commonNames as $en => $ar) {
            if (stripos($name, $en) !== false) {
                return $ar;
            }
        }

        // إذا فيه كلمات معينة
        if (stripos($name, 'chicken') !== false) return 'دجاج ' . $name;
        if (stripos($name, 'beef') !== false) return 'لحم بقر ' . $name;
        if (stripos($name, 'lamb') !== false) return 'لحم خروف ' . $name;
        if (stripos($name, 'fish') !== false) return 'سمك ' . $name;

        return $name; // اسم إنجليزي
    }


    private function fetchHalalRecipes()
    {
        try {
            $halalMeals = [];
            $processedIds = [];
            $attempts = 0;
            $maxAttempts = 4; // تقليل المحاولات

            while (count($halalMeals) < self::RECIPES_COUNT && $attempts < $maxAttempts) {
                $attempts++;

                $responses = Http::pool(
                    fn(Pool $pool) => collect(range(1, 8))->map(
                        fn() => $pool->timeout(6)->get(
                            'https://www.themealdb.com/api/json/v1/1/random.php'
                        )
                    )->toArray()
                );

                foreach ($responses as $response) {
                    if ($response->successful()) {
                        $meal = $response->json('meals.0');

                        if ($meal && !in_array($meal['idMeal'], $processedIds)) {
                            $processedIds[] = $meal['idMeal'];

                            if ($this->isHalal($meal)) {
                                $meal['ingredients'] = $this->extractIngredients($meal);
                                $halalMeals[] = $meal;

                                if (count($halalMeals) >= self::RECIPES_COUNT) {
                                    break 2;
                                }
                            }
                        }
                    }
                }
            }

            return $halalMeals;
        } catch (\Exception $e) {
            Log::error("Fetch halal error: " . $e->getMessage());
            return [];
        }
    }

    private function isHalal($meal)
    {
        $forbidden = [
            'pork',
            'bacon',
            'ham',
            'lard',
            'pancetta',
            'prosciutto',
            'salami',
            'wine',
            'beer',
            'alcohol',
            'rum',
            'vodka',
            'whiskey',
            'brandy',
            'sake',
            'liqueur'
        ];

        $mealText = strtolower(json_encode($meal));

        foreach ($forbidden as $word) {
            if (strpos($mealText, $word) !== false) {
                return false;
            }
        }

        return true;
    }

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

    private function translateCategory($category)
    {
        $translations = [
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
        ];

        return $translations[$category] ?? $category;
    }

    private function translateArea($area)
    {
        $translations = [
            'Egyptian' => 'مصري',
            'Moroccan' => 'مغربي',
            'Turkish' => 'تركي',
            'Tunisian' => 'تونسي',
            'American' => 'أمريكي',
            'British' => 'بريطاني',
            'Chinese' => 'صيني',
            'French' => 'فرنسي',
            'Greek' => 'يوناني',
            'Indian' => 'هندي',
            'Italian' => 'إيطالي',
            'Japanese' => 'ياباني',
            'Mexican' => 'مكسيكي',
            'Spanish' => 'إسباني',
            'Thai' => 'تايلندي'
        ];

        return $translations[$area] ?? $area;
    }

    public function clearCache(Request $request)
    {
        try {
            Cache::forget('random_halal_meals_v3_ar');
            Cache::forget('random_halal_meals_v3_en');

            return response()->json(['message' => 'Cache cleared']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed'], 500);
        }
    }
}
