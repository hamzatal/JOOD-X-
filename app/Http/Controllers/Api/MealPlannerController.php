<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class MealPlannerController extends Controller
{
    /**
     * Generate weekly meal plan (7 days x 3 meals) efficiently:
     * - Ask OpenAI to return only dish names (Arabic or English based on lang)
     * - For each dish name, query TheMealDB (search.php?s=...) to get full recipe details
     * - Cache the combined plan for 6 hours to avoid repeated AI calls
     */
    public function generate(Request $request)
    {
        $lang = $request->query('lang', 'en') === 'ar' ? 'ar' : 'en';
        $userPrefs = $request->input('prefs', []); // optional: dietary, cuisine, exclude, etc.
        $refresh = $request->query('refresh', 'false') === 'true';

        // Use a cache key per-language + per-pref hash
        $cacheKey = 'meal_planner_' . $lang . '_' . md5(json_encode($userPrefs));

        if (!$refresh && Cache::has($cacheKey)) {
            return response()->json([
                'success' => true,
                'source' => 'cache',
                'plan' => Cache::get($cacheKey),
            ]);
        }

        // 1) Ask OpenAI for dish names only (7 days x 3)
        $openaiKey = env('OPENAI_API_KEY');

        // If no OpenAI key, fallback to random selections from TheMealDB directly
        $dishNamesPlan = null;
        if ($openaiKey) {
            try {
                $system = $lang === 'ar'
                    ? "أنت مساعد شيف. أعد فقط أسماء أطباق غذائية (بدون وصف أو تعليمات) لتكوين خطة وجبات أسبوعية: 7 أيام، كل يوم: breakfast, lunch, dinner. لا تخرج عن التنسيق JSON. لا تكتب أي تعليق."
                    : "You are a chef assistant. Return only dish names for a weekly meal plan: 7 days, each day: breakfast, lunch, dinner. Return pure JSON only. No extra text.";

                $example = $lang === 'ar'
                    ? '[{"day":"اليوم 1","breakfast":"شكشوكة","lunch":"مقلوبة","dinner":"دجاج مشوي"}, ... total 7 entries]'
                    : '[{"day":"Day 1","breakfast":"Shakshuka","lunch":"Maqluba","dinner":"Grilled Chicken"}, ... total 7 entries]';

                $prompt = $lang === 'ar'
                    ? "أعِد JSON فقط مثل المثال التالي: {$example}.\n\nمراعاة: إن وُجد تفضيل مطبخ في prefs فالتزم به، وإلا فامزج بين أطباق عربية وعالمية."
                    : "Return JSON only like this example: {$example}.\n\nIf user prefs (diet/cuisine) exist, favor them; otherwise mix Arabic and international dishes.";

                // add short pref hint if provided
                if (!empty($userPrefs) && is_array($userPrefs)) {
                    $prefText = " Preferences: " . json_encode($userPrefs);
                    $prompt .= "\n" . $prefText;
                }

                $resp = Http::withToken($openaiKey)
                    ->timeout(20)
                    ->post('https://api.openai.com/v1/chat/completions', [
                        'model' => 'gpt-4o-mini',
                        'messages' => [
                            ['role' => 'system', 'content' => $system],
                            ['role' => 'user', 'content' => $prompt],
                        ],
                        'temperature' => 0.7,
                        'max_tokens' => 600,
                    ]);

                if ($resp->failed()) {
                    Log::warning('OpenAI failed: ' . $resp->body());
                } else {
                    $raw = $resp->json('choices.0.message.content') ?? $resp->body();
                    // try to extract JSON array from raw
                    $dishNamesPlan = $this->extractJson($raw);
                }
            } catch (\Exception $e) {
                Log::warning('OpenAI exception: ' . $e->getMessage());
            }
        }

        // If OpenAI not available or parsing failed -> fallback to quick random plan (TheMealDB)
        if (!$dishNamesPlan || !is_array($dishNamesPlan) || count($dishNamesPlan) < 7) {
            $dishNamesPlan = $this->buildFallbackDishNames($lang, $userPrefs);
        }

        // 2) For each dish name, fetch details from TheMealDB
        $fullPlan = [];
        foreach ($dishNamesPlan as $dayEntry) {
            $day = $dayEntry['day'] ?? ($dayEntry['Day'] ?? null);
            $breakfastName = $dayEntry['breakfast'] ?? $dayEntry['Breakfast'] ?? null;
            $lunchName = $dayEntry['lunch'] ?? $dayEntry['Lunch'] ?? null;
            $dinnerName = $dayEntry['dinner'] ?? $dayEntry['Dinner'] ?? null;

            $fullPlan[] = [
                'day' => $day ?? '',
                'breakfast' => $this->fetchMealDetailsByName($breakfastName, $lang),
                'lunch' => $this->fetchMealDetailsByName($lunchName, $lang),
                'dinner' => $this->fetchMealDetailsByName($dinnerName, $lang),
            ];
        }

        // Cache for 6 hours (21600 seconds)
        Cache::put($cacheKey, $fullPlan, 21600);

        return response()->json([
            'success' => true,
            'source' => 'api',
            'plan' => $fullPlan,
        ]);
    }

    /**
     * Try to fetch a meal details from TheMealDB by name.
     * Returns null if not found or a normalized object.
     */
    private function fetchMealDetailsByName($name, $lang = 'en')
    {
        if (!$name || trim($name) === '') return null;

        // prefer English search (TheMealDB responds better to English). If user requested Arabic, still try both.
        $queries = [$name];

        // if the name contains Arabic letters, add an English-transliteration search fallback (strip Arabic)
        $latin = preg_replace('/[\x{0600}-\x{06FF}]/u', '', $name);
        $latin = trim($latin);
        if ($latin && strtolower($latin) !== strtolower($name)) {
            $queries[] = $latin;
        }

        foreach ($queries as $q) {
            try {
                $res = Http::timeout(6)->get('https://www.themealdb.com/api/json/v1/1/search.php', [
                    's' => $q
                ]);

                if ($res->ok() && isset($res->json()['meals']) && $res->json()['meals']) {
                    // return the first match mapped to our normalized format
                    $m = $res->json()['meals'][0];
                    return $this->normalizeMealdb($m, $lang);
                }
            } catch (\Exception $e) {
                Log::warning('TheMealDB error: ' . $e->getMessage());
            }
        }

        // last resort: return a minimal object with name and no details
        return [
            'id' => null,
            'name' => $name,
            'image' => null,
            'ingredients' => [],
            'instructions' => null,
            'category' => null,
            'area' => null,
            'source' => 'not_found'
        ];
    }

    private function normalizeMealdb(array $m, $lang = 'en')
    {
        // جمع المكونات مع المقادير
        $ings = [];
        for ($i = 1; $i <= 20; $i++) {
            $ing = trim($m["strIngredient{$i}"] ?? '');
            $meas = trim($m["strMeasure{$i}"] ?? '');
            if ($ing !== '' && $ing !== null && strtolower($ing) !== 'null') {
                $ings[] = trim(($meas ? $meas . ' ' : '') . $ing);
            }
        }

        // استخراج Tags
        $tags = [];
        if (!empty($m['strTags'])) {
            $tags = array_map('trim', explode(',', $m['strTags']));
        }

        return [
            'id' => $m['idMeal'] ?? null,
            'idMeal' => $m['idMeal'] ?? null,
            'name' => $m['strMeal'] ?? null,
            'strMeal' => $m['strMeal'] ?? null,
            'strMealAr' => null, // يمكنك إضافة ترجمة لاحقاً
            'image' => $m['strMealThumb'] ?? null,
            'strMealThumb' => $m['strMealThumb'] ?? null,
            'ingredients' => $ings,
            'instructions' => $m['strInstructions'] ?? null,
            'strInstructions' => $m['strInstructions'] ?? null,
            'strInstructionsAr' => null,
            'category' => $m['strCategory'] ?? null,
            'strCategory' => $m['strCategory'] ?? null,
            'area' => $m['strArea'] ?? null,
            'strArea' => $m['strArea'] ?? null,
            'tags' => $tags,
            'strTags' => $m['strTags'] ?? null,
            'youtube' => $m['strYoutube'] ?? null,
            'strYoutube' => $m['strYoutube'] ?? null,
            'strSource' => $m['strSource'] ?? null,
            'source' => 'themealdb'
        ];
    }


    private function hasArabic($text)
    {
        return preg_match('/[\x{0600}-\x{06FF}]/u', $text);
    }

    /**
     * Quick fallback: build 7 simple entries using random TheMealDB picks (fast)
     */
    private function buildFallbackDishNames($lang, $prefs = [])
    {
        $days = [];
        for ($i = 1; $i <= 7; $i++) {
            // fetch random meal names quickly
            $randomBreakfast = $this->getRandomDishName();
            $randomLunch = $this->getRandomDishName();
            $randomDinner = $this->getRandomDishName();

            $days[] = [
                'day' => $lang === 'ar' ? "اليوم {$i}" : "Day {$i}",
                'breakfast' => $randomBreakfast,
                'lunch' => $randomLunch,
                'dinner' => $randomDinner,
            ];
        }
        return $days;
    }

    private function getRandomDishName()
    {
        try {
            $res = Http::timeout(5)->get('https://www.themealdb.com/api/json/v1/1/random.php');
            if ($res->ok() && isset($res->json()['meals'][0])) {
                return $res->json()['meals'][0]['strMeal'] ?? 'Meal';
            }
        } catch (\Exception $e) {
            //
        }
        return 'Meal';
    }

    private function extractJson($text)
    {
        if (empty($text)) return null;
        // direct decode
        $try = json_decode($text, true);
        if (json_last_error() === JSON_ERROR_NONE) return $try;

        // extract first JSON array/object
        if (preg_match('/\[[\s\S]*\]/s', $text, $m)) {
            $try = json_decode($m[0], true);
            if (json_last_error() === JSON_ERROR_NONE) return $try;
        }

        return null;
    }
    private function fetchBestImage($query)
    {
        // 1️⃣ — جرّب Spoonacular (الأدق للأطعمة)
        $img = $this->fetchFromSpoonacular($query);
        if ($img) return $img;

        // 2️⃣ — جرّب Pexels (صور احترافية)
        $img = $this->fetchFromPexels($query);
        if ($img) return $img;

        // 3️⃣ — جرّب Unsplash (صور جوده عالية)
        $img = $this->fetchFromUnsplash($query);
        if ($img) return $img;

        // 4️⃣ — fallback ذكي من Unsplash (صور طعام حقيقية)
        return "https://source.unsplash.com/800x600/?food,dish,meal";
    }
}
