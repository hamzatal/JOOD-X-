<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;

class HeroTrendController extends Controller
{
    private $forbiddenIngredients = [
        'pork',
        'bacon',
        'ham',
        'prosciutto',
        'pancetta',
        'lard',
        'chorizo',
        'salami',
        'pepperoni',
        'wine',
        'beer',
        'alcohol',
        'rum',
        'vodka',
        'whiskey',
        'brandy',
        'liqueur'
    ];

    public function index(Request $request)
    {
        try {
            $lang = $request->get('lang', 'en');
            $refresh = $request->get('refresh', false);

            // Cache key based on language
            $cacheKey = "hero_trending_meals_{$lang}";

            // إذا refresh = true، نحذف الكاش
            if ($refresh === 'true' || $refresh === true) {
                Cache::forget($cacheKey);
                Log::info("Cache cleared for: {$cacheKey}");
            }

            // Cache for 6 hours (21600 seconds)
            $recipes = Cache::remember($cacheKey, 21600, function () use ($lang) {
                Log::info("Fetching new recipes for language: {$lang}");

                $meals = [];
                $attempts = 0;
                $maxAttempts = 30;

                while (count($meals) < 10 && $attempts < $maxAttempts) {
                    $attempts++;

                    $res = Http::timeout(10)->get("https://www.themealdb.com/api/json/v1/1/random.php");

                    if ($res->ok() && isset($res->json()['meals'][0])) {
                        $meal = $res->json()['meals'][0];

                        // Check if halal
                        if ($this->isHalal($meal)) {
                            // Translate to Arabic if needed
                            if ($lang === 'ar') {
                                $meal = $this->translateMealToArabic($meal);
                            }
                            $meals[] = $meal;
                        }
                    }
                }

                Log::info("Fetched {count} halal recipes", ['count' => count($meals)]);
                return $meals;
            });

            return response()->json([
                "recipes" => $recipes,
                "cached" => !$refresh,
                "lang" => $lang
            ]);
        } catch (\Exception $e) {
            Log::error("Hero Trend Error: " . $e->getMessage());
            return response()->json([
                "error" => $e->getMessage()
            ], 500);
        }
    }

    private function isHalal($meal)
    {
        // Check ingredients
        for ($i = 1; $i <= 20; $i++) {
            $ingredient = strtolower($meal["strIngredient{$i}"] ?? '');

            if (empty($ingredient)) continue;

            foreach ($this->forbiddenIngredients as $forbidden) {
                if (strpos($ingredient, $forbidden) !== false) {
                    return false;
                }
            }
        }

        // Check category
        $category = strtolower($meal['strCategory'] ?? '');
        if (strpos($category, 'pork') !== false) {
            return false;
        }

        // Check instructions
        $instructions = strtolower($meal['strInstructions'] ?? '');
        foreach ($this->forbiddenIngredients as $forbidden) {
            if (strpos($instructions, $forbidden) !== false) {
                return false;
            }
        }

        return true;
    }

    private function translateMealToArabic($meal)
    {
        try {
            $openaiKey = env("OPENAI_API_KEY");
            if (!$openaiKey) {
                Log::warning("OpenAI key missing, using basic translation");
                return $this->basicTranslation($meal);
            }

            // Prepare ingredients list
            $ingredientsList = [];
            for ($i = 1; $i <= 20; $i++) {
                $ing = $meal["strIngredient{$i}"] ?? '';
                $measure = $meal["strMeasure{$i}"] ?? '';

                if (!empty($ing)) {
                    $ingredientsList[] = trim($measure . ' ' . $ing);
                }
            }

            $ingredientsText = implode(', ', $ingredientsList);

            // Translate using OpenAI
            $prompt = "ترجم هذه الوصفة للعربية بشكل احترافي:

العنوان: {$meal['strMeal']}
المكونات: {$ingredientsText}
التعليمات: {$meal['strInstructions']}

أعد JSON فقط بهذا الشكل:
{
  \"title\": \"اسم الوصفة بالعربي\",
  \"ingredients\": [\"مكون 1 بالعربي\", \"مكون 2 بالعربي\"],
  \"instructions\": \"خطوات التحضير بالعربي\"
}";

            $response = Http::timeout(30)
                ->withToken($openaiKey)
                ->post("https://api.openai.com/v1/chat/completions", [
                    "model" => "gpt-4o-mini",
                    "messages" => [
                        [
                            "role" => "system",
                            "content" => "أنت مترجم محترف للوصفات. أعد JSON فقط بدون أي نص إضافي."
                        ],
                        [
                            "role" => "user",
                            "content" => $prompt
                        ]
                    ],
                    "max_tokens" => 1500,
                    "temperature" => 0.3
                ]);

            if ($response->successful()) {
                $content = $response->json("choices.0.message.content");
                $translation = $this->extractJson($content);

                if ($translation) {
                    // Update meal with Arabic translation
                    $meal['strMealAr'] = $translation['title'] ?? $meal['strMeal'];
                    $meal['strInstructionsAr'] = $translation['instructions'] ?? $meal['strInstructions'];

                    // Update ingredients
                    if (isset($translation['ingredients']) && is_array($translation['ingredients'])) {
                        foreach ($translation['ingredients'] as $idx => $arabicIng) {
                            $i = $idx + 1;
                            if ($i <= 20) {
                                $meal["strIngredient{$i}Ar"] = $arabicIng;
                            }
                        }
                    }

                    Log::info("Recipe translated successfully: " . $meal['strMeal']);
                }
            }
        } catch (\Exception $e) {
            Log::warning("Translation failed, using basic: " . $e->getMessage());
        }

        // Add basic translations
        return $this->basicTranslation($meal);
    }

    private function basicTranslation($meal)
    {
        $categoryTranslations = [
            'Beef' => 'لحم بقر',
            'Chicken' => 'دجاج',
            'Dessert' => 'حلويات',
            'Lamb' => 'لحم خروف',
            'Miscellaneous' => 'متنوع',
            'Pasta' => 'معكرونة',
            'Seafood' => 'مأكولات بحرية',
            'Side' => 'أطباق جانبية',
            'Starter' => 'مقبلات',
            'Vegan' => 'نباتي',
            'Vegetarian' => 'نباتي',
            'Breakfast' => 'فطور',
            'Goat' => 'لحم ماعز'
        ];

        $areaTranslations = [
            'American' => 'أمريكي',
            'British' => 'بريطاني',
            'Canadian' => 'كندي',
            'Chinese' => 'صيني',
            'Croatian' => 'كرواتي',
            'Dutch' => 'هولندي',
            'Egyptian' => 'مصري',
            'French' => 'فرنسي',
            'Greek' => 'يوناني',
            'Indian' => 'هندي',
            'Irish' => 'إيرلندي',
            'Italian' => 'إيطالي',
            'Jamaican' => 'جامايكي',
            'Japanese' => 'ياباني',
            'Kenyan' => 'كيني',
            'Malaysian' => 'ماليزي',
            'Mexican' => 'مكسيكي',
            'Moroccan' => 'مغربي',
            'Polish' => 'بولندي',
            'Portuguese' => 'برتغالي',
            'Russian' => 'روسي',
            'Spanish' => 'إسباني',
            'Thai' => 'تايلاندي',
            'Tunisian' => 'تونسي',
            'Turkish' => 'تركي',
            'Vietnamese' => 'فيتنامي',
            'Unknown' => 'غير معروف'
        ];

        $meal['strCategoryAr'] = $categoryTranslations[$meal['strCategory']] ?? $meal['strCategory'];
        $meal['strAreaAr'] = $areaTranslations[$meal['strArea']] ?? $meal['strArea'];

        return $meal;
    }

    private function extractJson($text)
    {
        $backtick = chr(96);
        $text = str_replace($backtick . $backtick . $backtick . "json", "", $text);
        $text = str_replace($backtick . $backtick . $backtick, "", $text);
        $text = trim($text);

        $decoded = json_decode($text, true);
        if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
            return $decoded;
        }

        if (preg_match('/\{[\s\S]*\}/s', $text, $m)) {
            $decoded = json_decode($m[0], true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                return $decoded;
            }
        }

        return null;
    }
}
