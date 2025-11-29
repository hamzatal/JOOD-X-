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
    public function getTrendingRecipes(Request $request)
    {
        $lang = $request->query('lang', 'en');
        $refresh = $request->query('refresh', 'false') === 'true';
        $cacheKey = "trending_halal_recipes_{$lang}";

        Log::info("Request received", ['lang' => $lang, 'refresh' => $refresh]);

        if ($refresh) {
            Cache::forget($cacheKey);
        }

        try {
            $recipes = Cache::remember($cacheKey, 3600, function () use ($lang) {
                return $lang === 'ar' ? $this->fetchRealArabicRecipes() : $this->fetchInternationalRecipes();
            });

            if (empty($recipes)) {
                $recipes = $this->getFallbackRecipes($lang);
            }

            return response()->json(['recipes' => $recipes], 200);

        } catch (\Exception $e) {
            Log::error("Main error: " . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return response()->json([
                'recipes' => $this->getFallbackRecipes($lang),
                'error' => config('app.debug') ? $e->getMessage() : 'Failed'
            ], 200);
        }
    }

    private function fetchRealArabicRecipes()
    {
        try {
            $openaiKey = env('OPENAI_API_KEY');

            if ($openaiKey) {
                $recipes = $this->fetchAuthenticArabicFromOpenAI($openaiKey);
                if (!empty($recipes) && count($recipes) >= 5) {
                    Log::info("Using OpenAI recipes", ['count' => count($recipes)]);
                    return $recipes;
                }
            }

            Log::info("Using MealDB");
            return $this->fetchArabicRecipesFromMealDB();

        } catch (\Exception $e) {
            Log::error("fetchRealArabicRecipes error: " . $e->getMessage());
            return [];
        }
    }

    private function fetchAuthenticArabicFromOpenAI($openaiKey)
    {
        try {
            $cacheKey = "auth_arabic_v6";

            return Cache::remember($cacheKey, 3600, function () use ($openaiKey) {
                Log::info("Calling OpenAI");

                $response = Http::timeout(45)->withToken($openaiKey)
                    ->post('https://api.openai.com/v1/chat/completions', [
                        'model' => 'gpt-4o-mini',
                        'messages' => [
                            [
                                'role' => 'system',
                                'content' => 'أنت خبير طبخ عربي. أنشئ JSON array من 10 وصفات عربية.'
                            ],
                            [
                                'role' => 'user',
                                'content' => 'أنشئ 10 وصفات عربية (المقلوبة، المنسف، الكبسة، المندي، الملوخية، المسخن، الكبة، المجدرة، الفتة، الكشري). JSON فقط بدون markdown. كل وصفة: {idMeal, strMeal (عربي), strMealAr (عربي), strCategory: "Main", strCategoryAr: "طبق رئيسي", strArea, strAreaAr, strInstructions (إنجليزي), strInstructionsAr (عربي 5 خطوات), strMealThumb, strIngredient1-10, strIngredient1Ar-10Ar, strMeasure1-10}'
                            ]
                        ],
                        'max_tokens' => 4500,
                        'temperature' => 0.8
                    ]);

                if ($response->failed()) {
                    Log::error("OpenAI failed", ['status' => $response->status()]);
                    return [];
                }

                $content = $response->json('choices.0.message.content', '');
                if (empty($content)) {
                    Log::error("Empty OpenAI response");
                    return [];
                }

                // Clean content
                $content = str_replace('```json', '', $content);
                $content = str_replace('```', '', $content);
                $content = trim($content);

                $recipes = json_decode($content, true);

                if (json_last_error() !== JSON_ERROR_NONE) {
                    Log::warning("JSON error: " . json_last_error_msg());
                    
                    // Try extract array
                    if (preg_match('/\[.*\]/s', $content, $matches)) {
                        $recipes = json_decode($matches[0], true);
                    }
                }

                if (!is_array($recipes)) {
                    Log::error("Not array");
                    return [];
                }

                // Process
                $processed = [];
                foreach ($recipes as $i => $r) {
                    $r['strMealAr'] = $r['strMealAr'] ?? $r['strMeal'] ?? "وصفة " . ($i+1);
                    $r['strCategoryAr'] = $r['strCategoryAr'] ?? 'طبق رئيسي';
                    $r['strAreaAr'] = $r['strAreaAr'] ?? 'عربي';
                    $r['strInstructionsAr'] = $r['strInstructionsAr'] ?? '';
                    $r['strMealThumb'] = $r['strMealThumb'] ?? 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800';
                    $r['idMeal'] = $r['idMeal'] ?? 'ar_' . ($i+1);

                    $ingredients = [];
                    for ($j = 1; $j <= 20; $j++) {
                        $ing = $r["strIngredient{$j}"] ?? null;
                        $mea = $r["strMeasure{$j}"] ?? null;
                        if ($ing) $ingredients[] = trim(($mea ?? '') . ' ' . $ing);
                    }
                    $r['ingredients'] = $ingredients;

                    $processed[] = $r;
                }

                Log::info("OpenAI success", ['count' => count($processed)]);
                return $processed;
            });

        } catch (\Exception $e) {
            Log::error("OpenAI exception: " . $e->getMessage());
            return [];
        }
    }

    private function fetchArabicRecipesFromMealDB()
    {
        try {
            $areas = ['Egyptian', 'Moroccan', 'Turkish'];
            $all = [];

            $responses = Http::pool(fn ($pool) => collect($areas)->map(
                fn($a) => $pool->timeout(6)->get("https://www.themealdb.com/api/json/v1/1/filter.php?a={$a}")
            )->toArray());

            foreach ($responses as $r) {
                if ($r->successful()) {
                    $meals = $r->json('meals', []);
                    if ($meals) $all = array_merge($all, $meals);
                }
            }

            if (empty($all)) return [];

            $selected = collect($all)->shuffle()->take(10)->toArray();
            return $this->fetchDetailsWithTranslation($selected);

        } catch (\Exception $e) {
            Log::error("MealDB error: " . $e->getMessage());
            return [];
        }
    }

    private function fetchDetailsWithTranslation($basic)
    {
        try {
            $ids = collect($basic)->pluck('idMeal')->filter()->toArray();
            if (empty($ids)) return [];

            $responses = Http::pool(fn ($pool) => collect($ids)->map(
                fn($id) => $pool->timeout(6)->get("https://www.themealdb.com/api/json/v1/1/lookup.php?i={$id}")
            )->toArray());

            $final = [];
            foreach ($responses as $r) {
                if ($r->successful()) {
                    $meal = $r->json('meals.0');
                    if ($meal && $this->isHalal($meal)) {
                        $meal['ingredients'] = $this->extractIngredients($meal);
                        $meal = $this->translateMeal($meal);
                        $final[] = $meal;
                        if (count($final) >= 8) break;
                    }
                }
            }

            return $final;

        } catch (\Exception $e) {
            Log::error("Details error: " . $e->getMessage());
            return [];
        }
    }

    private function translateMeal($meal)
    {
        $key = env('OPENAI_API_KEY');
        
        $meal['strCategoryAr'] = $this->trans($meal['strCategory'] ?? '', 'cat');
        $meal['strAreaAr'] = $this->trans($meal['strArea'] ?? '', 'area');

        if (!$key) {
            $meal['strMealAr'] = $meal['strMeal'] ?? '';
            $meal['strInstructionsAr'] = $meal['strInstructions'] ?? '';
            return $meal;
        }

        try {
            // Name
            $nk = "name_v5_" . md5($meal['strMeal'] ?? '');
            $name = Cache::remember($nk, 604800, function () use ($meal, $key) {
                $r = Http::timeout(8)->withToken($key)
                    ->post('https://api.openai.com/v1/chat/completions', [
                        'model' => 'gpt-4o-mini',
                        'messages' => [
                            ['role' => 'system', 'content' => 'ترجم للعربية'],
                            ['role' => 'user', 'content' => $meal['strMeal'] ?? '']
                        ],
                        'max_tokens' => 20
                    ]);
                return $r->successful() ? trim($r->json('choices.0.message.content')) : null;
            });

            $meal['strMealAr'] = $name ?: ($meal['strMeal'] ?? '');

            // Instructions
            $inst = $meal['strInstructions'] ?? '';
            if ($inst) {
                $ik = "inst_v5_" . md5($inst);
                $trans = Cache::remember($ik, 604800, function () use ($inst, $key) {
                    $r = Http::timeout(40)->withToken($key)
                        ->post('https://api.openai.com/v1/chat/completions', [
                            'model' => 'gpt-4o',
                            'messages' => [
                                ['role' => 'system', 'content' => 'ترجم كل النص للعربية'],
                                ['role' => 'user', 'content' => "ترجم:\n\n{$inst}"]
                            ],
                            'max_tokens' => 3000
                        ]);
                    return $r->successful() ? trim($r->json('choices.0.message.content')) : $inst;
                });

                $meal['strInstructionsAr'] = $trans;
            }

            // Ingredients
            $meal = $this->transIngredients($meal, $key);

        } catch (\Exception $e) {
            Log::error("Trans error: " . $e->getMessage());
            $meal['strMealAr'] = $meal['strMeal'] ?? '';
            $meal['strInstructionsAr'] = $meal['strInstructions'] ?? '';
        }

        return $meal;
    }

    private function transIngredients($meal, $key)
    {
        $dict = [
            'chicken' => 'دجاج', 'rice' => 'أرز', 'beef' => 'لحم بقر',
            'onion' => 'بصل', 'garlic' => 'ثوم', 'salt' => 'ملح',
        ];

        for ($i = 1; $i <= 20; $i++) {
            $ing = $meal["strIngredient{$i}"] ?? null;
            if (!$ing) continue;

            $k = "ing_v3_" . md5(strtolower($ing));
            $t = Cache::remember($k, 604800, function () use ($ing, $dict, $key) {
                $low = strtolower($ing);
                if (isset($dict[$low])) return $dict[$low];

                try {
                    $r = Http::timeout(5)->withToken($key)
                        ->post('https://api.openai.com/v1/chat/completions', [
                            'model' => 'gpt-4o-mini',
                            'messages' => [
                                ['role' => 'system', 'content' => 'ترجم للعربية'],
                                ['role' => 'user', 'content' => $ing]
                            ],
                            'max_tokens' => 15
                        ]);
                    return $r->successful() ? trim($r->json('choices.0.message.content')) : $ing;
                } catch (\Exception $e) {
                    return $ing;
                }
            });

            $meal["strIngredient{$i}Ar"] = $t;
        }

        return $meal;
    }

    private function trans($text, $type)
    {
        $d = [
            'cat' => ['Beef' => 'لحم بقر', 'Chicken' => 'دجاج', 'Main' => 'طبق رئيسي'],
            'area' => ['Egyptian' => 'مصري', 'Moroccan' => 'مغربي', 'Turkish' => 'تركي']
        ];
        return $d[$type][$text] ?? $text;
    }

    private function fetchInternationalRecipes()
    {
        try {
            $cats = ['Beef', 'Chicken', 'Pasta', 'Dessert'];
            $all = [];

            $responses = Http::pool(fn ($pool) => collect($cats)->map(
                fn($c) => $pool->timeout(6)->get("https://www.themealdb.com/api/json/v1/1/filter.php?c={$c}")
            )->toArray());

            foreach ($responses as $r) {
                if ($r->successful()) {
                    $meals = $r->json('meals', []);
                    if ($meals) $all = array_merge($all, $meals);
                }
            }

            if (empty($all)) return [];

            $selected = collect($all)->shuffle()->take(10)->toArray();
            return $this->fetchDetailsEnglish($selected);

        } catch (\Exception $e) {
            return [];
        }
    }

    private function fetchDetailsEnglish($basic)
    {
        try {
            $ids = collect($basic)->pluck('idMeal')->filter()->toArray();
            if (empty($ids)) return [];

            $responses = Http::pool(fn ($pool) => collect($ids)->map(
                fn($id) => $pool->timeout(6)->get("https://www.themealdb.com/api/json/v1/1/lookup.php?i={$id}")
            )->toArray());

            $final = [];
            foreach ($responses as $r) {
                if ($r->successful()) {
                    $meal = $r->json('meals.0');
                    if ($meal && $this->isHalal($meal)) {
                        $meal['ingredients'] = $this->extractIngredients($meal);
                        $final[] = $meal;
                        if (count($final) >= 10) break;
                    }
                }
            }

            return $final;
        } catch (\Exception $e) {
            return [];
        }
    }

    private function isHalal($meal)
    {
        $forbidden = ['pork', 'bacon', 'ham', 'wine', 'beer', 'alcohol'];
        $text = strtolower(json_encode($meal));
        foreach ($forbidden as $w) {
            if (strpos($text, $w) !== false) return false;
        }
        return true;
    }

    private function extractIngredients($meal)
    {
        $list = [];
        for ($i = 1; $i <= 20; $i++) {
            $ing = $meal["strIngredient{$i}"] ?? null;
            $mea = $meal["strMeasure{$i}"] ?? null;
            if ($ing) $list[] = trim(($mea ?? '') . ' ' . $ing);
        }
        return $list;
    }

    private function getFallbackRecipes($lang)
    {
        try {
            $responses = Http::pool(fn ($pool) => collect(range(1, 8))->map(
                fn() => $pool->timeout(5)->get('https://www.themealdb.com/api/json/v1/1/random.php')
            )->toArray());

            $recipes = [];
            foreach ($responses as $r) {
                if ($r->successful()) {
                    $meal = $r->json('meals.0');
                    if ($meal && $this->isHalal($meal)) {
                        $meal['ingredients'] = $this->extractIngredients($meal);
                        if ($lang === 'ar') $meal = $this->translateMeal($meal);
                        $recipes[] = $meal;
                        if (count($recipes) >= 5) break;
                    }
                }
            }

            return $recipes;
        } catch (\Exception $e) {
            return [];
        }
    }

    public function clearCache()
    {
        Cache::forget('trending_halal_recipes_ar');
        Cache::forget('trending_halal_recipes_en');
        Cache::forget('auth_arabic_v6');
        return response()->json(['message' => 'Cleared']);
    }
}
