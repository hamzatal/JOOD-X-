<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class HomePageController extends Controller
{
    private const CACHE_DURATION = 3600;
    private const RECIPES_COUNT = 5;
    private const OPENAI_TIMEOUT = 25;
    private const MEALDB_TIMEOUT = 5;

    public function getTrendingRecipes(Request $request)
    {
        set_time_limit(180);
        
        $lang = $request->query('lang', 'en');
        $refresh = $request->query('refresh', 'false') === 'true';
        $cacheKey = "trending_recipes_v5_{$lang}";

        if ($refresh) {
            Cache::forget($cacheKey);
        }

        try {
            $recipes = Cache::remember($cacheKey, self::CACHE_DURATION, function () use ($lang) {
                return $this->generateRecipes($lang);
            });

            if (empty($recipes)) {
                $recipes = $this->getFallbackRecipes($lang);
            }

            $recipes = array_slice($recipes, 0, self::RECIPES_COUNT);

            return response()->json([
                'recipes' => $recipes,
                'count' => count($recipes)
            ], 200);

        } catch (\Exception $e) {
            Log::error("Error: " . $e->getMessage());
            
            $fallback = $this->getFallbackRecipes($lang);
            
            return response()->json([
                'recipes' => array_slice($fallback, 0, self::RECIPES_COUNT),
                'message' => 'Using fallback'
            ], 200);
        }
    }

    private function generateRecipes(string $lang): array
    {
        if ($lang === 'ar') {
            return $this->fetchArabicRecipes();
        }
        
        return $this->fetchInternationalRecipes();
    }

    private function fetchArabicRecipes(): array
    {
        Log::info("Fetching Arabic recipes");
        
        try {
            // جلب من المناطق العربية في MealDB
            $arabicAreas = ['Egyptian', 'Moroccan', 'Turkish', 'Tunisian'];
            $allMeals = [];
            
            foreach ($arabicAreas as $area) {
                try {
                    $response = Http::timeout(self::MEALDB_TIMEOUT)
                        ->get("https://www.themealdb.com/api/json/v1/1/filter.php?a={$area}");
                    
                    if ($response->successful()) {
                        $meals = $response->json('meals', []);
                        if ($meals) {
                            $allMeals = array_merge($allMeals, $meals);
                        }
                    }
                } catch (\Exception $e) {
                    Log::warning("Area fetch failed: {$area}");
                }
            }

            if (empty($allMeals)) {
                Log::warning("No meals from Arab areas, using OpenAI");
                return $this->generateWithOpenAI('ar');
            }

            // اختيار عشوائي
            $selected = collect($allMeals)->shuffle()->take(8)->pluck('idMeal')->toArray();
            
            return $this->fetchMealDetails($selected, 'ar');

        } catch (\Exception $e) {
            Log::error("Arabic fetch error: " . $e->getMessage());
            return $this->generateWithOpenAI('ar');
        }
    }

    private function fetchInternationalRecipes(): array
    {
        Log::info("Fetching international recipes");
        
        try {
            $recipes = [];
            $attempts = 0;
            $maxAttempts = 20;

            while (count($recipes) < self::RECIPES_COUNT && $attempts < $maxAttempts) {
                $attempts++;
                
                try {
                    $response = Http::timeout(self::MEALDB_TIMEOUT)
                        ->get('https://www.themealdb.com/api/json/v1/1/random.php');
                    
                    if ($response->successful()) {
                        $meal = $response->json('meals.0');
                        
                        if ($meal && $this->isHalal($meal)) {
                            $meal['ingredients'] = $this->extractIngredients($meal);
                            $meal['strDescription'] = $this->generateDescription($meal);
                            $recipes[] = $meal;
                        }
                    }
                } catch (\Exception $e) {
                    // continue
                }

                usleep(150000);
            }

            return $recipes;

        } catch (\Exception $e) {
            Log::error("International fetch error: " . $e->getMessage());
            return [];
        }
    }

    private function fetchMealDetails(array $mealIds, string $lang): array
    {
        $recipes = [];
        
        foreach ($mealIds as $id) {
            if (count($recipes) >= self::RECIPES_COUNT) {
                break;
            }

            try {
                $response = Http::timeout(self::MEALDB_TIMEOUT)
                    ->get("https://www.themealdb.com/api/json/v1/1/lookup.php?i={$id}");
                
                if ($response->successful()) {
                    $meal = $response->json('meals.0');
                    
                    if ($meal && $this->isHalal($meal)) {
                        $meal['ingredients'] = $this->extractIngredients($meal);
                        $meal['strDescription'] = $this->generateDescription($meal);
                        
                        if ($lang === 'ar') {
                            $meal = $this->translateMeal($meal);
                        }
                        
                        $recipes[] = $meal;
                    }
                }
            } catch (\Exception $e) {
                Log::warning("Meal detail fetch failed: {$id}");
            }

            usleep(100000);
        }

        return $recipes;
    }

    private function generateWithOpenAI(string $lang): array
    {
        $apiKey = env('OPENAI_API_KEY');
        
        if (!$apiKey) {
            return [];
        }

        $cacheKey = "openai_dynamic_{$lang}_" . date('Y-m-d-H');
        
        return Cache::remember($cacheKey, 1800, function () use ($apiKey, $lang) {
            try {
                $prompt = $lang === 'ar' 
                    ? $this->getDynamicArabicPrompt() 
                    : $this->getDynamicInternationalPrompt();

                $response = Http::timeout(self::OPENAI_TIMEOUT)
                    ->withToken($apiKey)
                    ->post('https://api.openai.com/v1/chat/completions', [
                        'model' => 'gpt-4o-mini',
                        'messages' => [
                            ['role' => 'user', 'content' => $prompt]
                        ],
                        'max_tokens' => 4000,
                        'temperature' => 1.0, // maximum randomness
                    ]);

                if ($response->failed()) {
                    return [];
                }

                $content = $response->json('choices.0.message.content', '');
                return $this->parseOpenAIResponse($content, $lang);

            } catch (\Exception $e) {
                Log::error("OpenAI generation failed: " . $e->getMessage());
                return [];
            }
        });
    }

    private function getDynamicArabicPrompt(): string
    {
        // توليد رقم عشوائي لضمان التنوع
        $randomSeed = rand(1000, 9999);
        
        return <<<PROMPT
أنشئ 5 وصفات عربية فريدة ومختلفة تماماً عن أي وصفات سابقة. استخدم هذا الرقم العشوائي للتنويع: {$randomSeed}

اختر من المطابخ العربية المختلفة (مصري، شامي، خليجي، مغاربي، عراقي، سوداني، يمني).

كل وصفة يجب أن تكون:
- فريدة ومختلفة
- لها اسم عربي أصيل
- من منطقة عربية محددة
- مكونات عربية تقليدية

JSON format:
[
{
"idMeal": "unique_id",
"strMeal": "English Name",
"strMealAr": "الاسم العربي",
"strCategory": "Main Course",
"strCategoryAr": "طبق رئيسي",
"strArea": "Egyptian/Syrian/Saudi/etc",
"strAreaAr": "مصري/سوري/سعودي/إلخ",
"strDescription": "English description (60 words)",
"strDescriptionAr": "وصف عربي شهي (60 كلمة)",
"strInstructions": "English steps (5-7 steps)",
"strInstructionsAr": "خطوات عربية (5-7 خطوات)",
"strMealThumb": "https://images.unsplash.com/photo-XXXXX?w=800",
"strIngredient1": "ingredient",
"strIngredient1Ar": "مكون",
"strMeasure1": "amount"
}
]


JSON فقط، بدون markdown.
PROMPT;
    }

    private function getDynamicInternationalPrompt(): string
    {
        $randomSeed = rand(1000, 9999);
        
        return <<<PROMPT
Create 5 unique international recipes. Random seed: {$randomSeed}

Each from different cuisine (Italian, Asian, Mexican, Mediterranean, American, French, etc).

JSON format only, no markdown.
PROMPT;
    }

    private function parseOpenAIResponse(string $content, string $lang): array
    {
        $content = preg_replace('/```\s*/', '', $content);
        $content = trim($content);

        if (preg_match('/\[.*\]/s', $content, $matches)) {
            $content = $matches[0];
        }

        $recipes = json_decode($content, true);

        if (json_last_error() !== JSON_ERROR_NONE || !is_array($recipes)) {
            return [];
        }

        return array_map(fn($r) => $this->normalizeRecipe($r, $lang), $recipes);
    }

    private function normalizeRecipe(array $recipe, string $lang): array
    {
        $recipe['idMeal'] = $recipe['idMeal'] ?? uniqid();
        $recipe['strMeal'] = $recipe['strMeal'] ?? 'Recipe';
        $recipe['strCategory'] = $recipe['strCategory'] ?? 'Main Course';
        $recipe['strArea'] = $recipe['strArea'] ?? 'International';
        $recipe['strDescription'] = $recipe['strDescription'] ?? '';
        $recipe['strInstructions'] = $recipe['strInstructions'] ?? '';
        $recipe['strMealThumb'] = $recipe['strMealThumb'] ?? 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800';

        if ($lang === 'ar') {
            $recipe['strMealAr'] = $recipe['strMealAr'] ?? $recipe['strMeal'];
            $recipe['strCategoryAr'] = $recipe['strCategoryAr'] ?? $recipe['strCategory'];
            $recipe['strAreaAr'] = $recipe['strAreaAr'] ?? $recipe['strArea'];
            $recipe['strDescriptionAr'] = $recipe['strDescriptionAr'] ?? $recipe['strDescription'];
            $recipe['strInstructionsAr'] = $recipe['strInstructionsAr'] ?? $recipe['strInstructions'];
        }

        $ingredients = [];
        for ($i = 1; $i <= 20; $i++) {
            $ing = $recipe["strIngredient{$i}"] ?? null;
            $measure = $recipe["strMeasure{$i}"] ?? '';
            if ($ing) {
                $ingredients[] = trim($measure . ' ' . $ing);
            }
        }
        $recipe['ingredients'] = $ingredients;

        return $recipe;
    }

    private function translateMeal(array $meal): array
    {
        $apiKey = env('OPENAI_API_KEY');
        
        if (!$apiKey) {
            return $this->addBasicTranslations($meal);
        }

        try {
            $meal['strMealAr'] = $this->translateText($meal['strMeal'], 'name', $apiKey);
            $meal['strCategoryAr'] = $this->translateCategory($meal['strCategory'] ?? '');
            $meal['strAreaAr'] = $this->translateArea($meal['strArea'] ?? '');
            
            if (!empty($meal['strDescription'])) {
                $meal['strDescriptionAr'] = $this->translateText($meal['strDescription'], 'description', $apiKey);
            }
            
            if (!empty($meal['strInstructions'])) {
                $meal['strInstructionsAr'] = $this->translateText($meal['strInstructions'], 'instructions', $apiKey);
            }

            for ($i = 1; $i <= 20; $i++) {
                $ing = $meal["strIngredient{$i}"] ?? null;
                if ($ing && trim($ing)) {
                    $meal["strIngredient{$i}Ar"] = $this->translateIngredient($ing, $apiKey);
                }
            }

        } catch (\Exception $e) {
            Log::error("Translation failed: " . $e->getMessage());
            return $this->addBasicTranslations($meal);
        }

        return $meal;
    }

    private function translateText(string $text, string $type, string $apiKey): string
    {
        $cacheKey = "trans_{$type}_" . md5($text);
        
        return Cache::remember($cacheKey, 604800, function () use ($text, $type, $apiKey) {
            try {
                $maxTokens = match($type) {
                    'name' => 30,
                    'description' => 200,
                    'instructions' => 2000,
                    default => 100
                };

                $response = Http::timeout(15)
                    ->withToken($apiKey)
                    ->post('https://api.openai.com/v1/chat/completions', [
                        'model' => 'gpt-4o-mini',
                        'messages' => [
                            ['role' => 'system', 'content' => 'ترجم للعربية بدقة'],
                            ['role' => 'user', 'content' => $text]
                        ],
                        'max_tokens' => $maxTokens,
                        'temperature' => 0.3
                    ]);

                if ($response->successful()) {
                    return trim($response->json('choices.0.message.content', $text));
                }

            } catch (\Exception $e) {
                // silent fail
            }

            return $text;
        });
    }

    private function translateIngredient(string $ingredient, string $apiKey): string
    {
        $dict = [
            'chicken' => 'دجاج', 'beef' => 'لحم بقر', 'rice' => 'أرز',
            'onion' => 'بصل', 'garlic' => 'ثوم', 'salt' => 'ملح',
            'pepper' => 'فلفل', 'oil' => 'زيت', 'tomato' => 'طماطم',
        ];

        $lower = strtolower(trim($ingredient));
        return $dict[$lower] ?? $this->translateText($ingredient, 'ingredient', $apiKey);
    }

    private function addBasicTranslations(array $meal): array
    {
        $meal['strMealAr'] = $meal['strMeal'];
        $meal['strCategoryAr'] = $this->translateCategory($meal['strCategory'] ?? '');
        $meal['strAreaAr'] = $this->translateArea($meal['strArea'] ?? '');
        $meal['strDescriptionAr'] = $meal['strDescription'] ?? '';
        $meal['strInstructionsAr'] = $meal['strInstructions'] ?? '';

        for ($i = 1; $i <= 20; $i++) {
            $ing = $meal["strIngredient{$i}"] ?? null;
            if ($ing) {
                $meal["strIngredient{$i}Ar"] = $ing;
            }
        }

        return $meal;
    }

    private function isHalal(array $meal): bool
    {
        $forbidden = ['pork', 'bacon', 'ham', 'wine', 'beer', 'alcohol', 'rum', 'vodka', 'lard'];
        $text = strtolower(json_encode($meal));
        
        foreach ($forbidden as $word) {
            if (strpos($text, $word) !== false) {
                return false;
            }
        }
        
        return true;
    }

    private function extractIngredients(array $meal): array
    {
        $ingredients = [];
        for ($i = 1; $i <= 20; $i++) {
            $ing = $meal["strIngredient{$i}"] ?? null;
            $measure = $meal["strMeasure{$i}"] ?? '';
            if ($ing && trim($ing)) {
                $ingredients[] = trim($measure . ' ' . $ing);
            }
        }
        return $ingredients;
    }

    private function generateDescription(array $meal): string
    {
        $category = $meal['strCategory'] ?? 'dish';
        $area = $meal['strArea'] ?? 'cuisine';
        return "A delicious {$category} from {$area} cuisine with authentic flavors and fresh ingredients.";
    }

    private function translateCategory(string $cat): string
    {
        $t = ['Beef' => 'لحم بقر', 'Chicken' => 'دجاج', 'Dessert' => 'حلويات', 'Vegetarian' => 'نباتي'];
        return $t[$cat] ?? $cat;
    }

    private function translateArea(string $area): string
    {
        $t = ['Egyptian' => 'مصري', 'Moroccan' => 'مغربي', 'Turkish' => 'تركي', 'Tunisian' => 'تونسي'];
        return $t[$area] ?? $area;
    }

    private function getFallbackRecipes(string $lang): array
    {
        return $lang === 'ar' ? $this->fetchArabicRecipes() : $this->fetchInternationalRecipes();
    }

    public function clearCache()
    {
        Cache::flush();
        return response()->json(['message' => 'Cache cleared']);
    }
}
