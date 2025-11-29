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
    /**
     * جلب وصفات عشوائية حلال (محسّن بـ Http::pool)
     */
    public function index(Request $request)
    {
        try {
            $lang = $request->get('lang', 'en');
            $refresh = $request->get('refresh', 'false');

            $cacheKey = "random_halal_meals_{$lang}";

            Log::info("Random halal recipes request", ['lang' => $lang, 'refresh' => $refresh]);

            // حذف Cache عند الطلب
            if ($refresh === 'true') {
                Cache::forget($cacheKey);
                Log::info("Cache cleared: {$cacheKey}");
            }

            // Cache لمدة 6 ساعات (حسب الكود القديم)
            $recipes = Cache::remember($cacheKey, 21600, function () use ($lang) {
                return $this->fetchHalalRecipes($lang);
            });

            // ترجمة إذا كانت اللغة عربية
            if ($lang === 'ar') {
                foreach ($recipes as &$recipe) {
                    $recipe = $this->translateRecipe($recipe);
                }
            }

            Log::info("Returning recipes", ['count' => count($recipes), 'lang' => $lang]);

            return response()->json(['recipes' => $recipes]);
        } catch (\Exception $e) {
            Log::error("Error in random recipes: " . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'error' => config('app.debug') ? $e->getMessage() : 'Failed to fetch recipes',
                'recipes' => []
            ], 500);
        }
    }

    /**
     * جلب وصفات حلال بشكل متزامن (سريع جداً)
     */
    private function fetchHalalRecipes($lang)
    {
        try {
            $halalMeals = [];
            $processedIds = [];
            $attempts = 0;
            $maxAttempts = 5; // عدد الدفعات المتزامنة

            Log::info("Starting to fetch halal recipes");

            // جلب دفعات متزامنة حتى نحصل على 12 وصفة حلال
            while (count($halalMeals) < 12 && $attempts < $maxAttempts) {
                $attempts++;

                Log::info("Batch attempt #{$attempts}");

                // جلب 10 وصفات بشكل متزامن في كل دفعة
                $responses = Http::pool(
                    fn(Pool $pool) =>
                    collect(range(1, 10))->map(
                        fn() =>
                        $pool->timeout(8)->get('https://www.themealdb.com/api/json/v1/1/random.php')
                    )->toArray()
                );

                // معالجة النتائج وفلترة الحلال
                foreach ($responses as $response) {
                    if ($response->successful()) {
                        $meal = $response->json('meals.0');

                        if ($meal && !in_array($meal['idMeal'], $processedIds)) {
                            $processedIds[] = $meal['idMeal'];

                            // فحص الحلال
                            if ($this->isHalal($meal)) {
                                // استخراج المكونات
                                $meal['ingredients'] = $this->extractIngredients($meal);

                                $halalMeals[] = $meal;

                                Log::info("Halal recipe found", [
                                    'id' => $meal['idMeal'],
                                    'name' => $meal['strMeal'],
                                    'total' => count($halalMeals)
                                ]);

                                // توقف إذا وصلنا للعدد المطلوب
                                if (count($halalMeals) >= 12) {
                                    break 2;
                                }
                            } else {
                                Log::debug("Non-halal recipe filtered", [
                                    'id' => $meal['idMeal'],
                                    'name' => $meal['strMeal']
                                ]);
                            }
                        }
                    }
                }

                Log::info("Batch #{$attempts} complete", ['halal_count' => count($halalMeals)]);
            }

            Log::info("Halal recipes fetching completed", [
                'total' => count($halalMeals),
                'attempts' => $attempts
            ]);

            return $halalMeals;
        } catch (\Exception $e) {
            Log::error("Error fetching halal recipes: " . $e->getMessage());
            return [];
        }
    }

    /**
     * فحص هل الوصفة حلال (محسّن)
     */
    private function isHalal($meal)
    {
        // قائمة المكونات المحرمة (موسعة)
        $forbidden = [
            'pork',
            'bacon',
            'ham',
            'lard',
            'pancetta',
            'prosciutto',
            'salami', // لحم خنزير
            'wine',
            'beer',
            'alcohol',
            'rum',
            'vodka',
            'whiskey',
            'brandy',
            'sake',
            'liqueur', // كحول
            'gelatin' // قد يكون من مصدر غير حلال
        ];

        // تحويل كل بيانات الوصفة إلى نص صغير
        $mealText = strtolower(json_encode($meal));

        // فحص وجود أي مكون محرم
        foreach ($forbidden as $word) {
            if (strpos($mealText, $word) !== false) {
                Log::debug("Non-halal ingredient detected", [
                    'meal' => $meal['strMeal'] ?? 'Unknown',
                    'ingredient' => $word
                ]);
                return false;
            }
        }

        return true;
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
     * ترجمة الوصفة للعربية (محسّنة وموسعة)
     */
    private function translateRecipe($meal)
    {
        // ترجمة الفئات
        $categoryTranslations = [
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
            'Goat' => 'لحم ماعز',
            'Pork' => 'لحم خنزير',
            'Miscellaneous' => 'متنوع'
        ];

        // ترجمة البلدان/المناطق
        $areaTranslations = [
            'American' => 'أمريكي',
            'British' => 'بريطاني',
            'Canadian' => 'كندي',
            'Chinese' => 'صيني',
            'Croatian' => 'كرواتي',
            'Dutch' => 'هولندي',
            'Egyptian' => 'مصري',
            'Filipino' => 'فلبيني',
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
            'Thai' => 'تايلندي',
            'Tunisian' => 'تونسي',
            'Turkish' => 'تركي',
            'Ukrainian' => 'أوكراني',
            'Vietnamese' => 'فيتنامي',
            'Unknown' => 'غير معروف'
        ];

        // إضافة الحقول المترجمة
        $meal['strMealAr'] = $meal['strMeal'] ?? '';
        $meal['strCategoryAr'] = $categoryTranslations[$meal['strCategory'] ?? ''] ?? ($meal['strCategory'] ?? '');
        $meal['strAreaAr'] = $areaTranslations[$meal['strArea'] ?? ''] ?? ($meal['strArea'] ?? '');
        $meal['strInstructionsAr'] = $meal['strInstructions'] ?? '';

        // للتوافق مع الكود القديم
        $meal['categoryAr'] = $meal['strCategoryAr'];
        $meal['areaAr'] = $meal['strAreaAr'];

        return $meal;
    }

    /**
     * حذف Cache الوصفات العشوائية
     */
    public function clearCache(Request $request)
    {
        try {
            $lang = $request->get('lang');

            if ($lang) {
                Cache::forget("random_halal_meals_{$lang}");
                Log::info("Random recipes cache cleared for language: {$lang}");
            } else {
                Cache::forget('random_halal_meals_ar');
                Cache::forget('random_halal_meals_en');
                Log::info("All random recipes cache cleared");
            }

            return response()->json(['message' => 'Cache cleared successfully']);
        } catch (\Exception $e) {
            Log::error("Error clearing cache: " . $e->getMessage());
            return response()->json(['error' => 'Failed to clear cache'], 500);
        }
    }
}
