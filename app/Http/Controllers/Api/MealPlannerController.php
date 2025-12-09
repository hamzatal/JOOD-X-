<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class MealPlannerController extends Controller
{
    public function generate(Request $request)
    {
        $lang = $request->query('lang', 'en') === 'ar' ? 'ar' : 'en';
        $refresh = $request->query('refresh', 'false') === 'true';

        $cacheKey = 'meal_planner_' . $lang;

        if (!$refresh && Cache::has($cacheKey)) {
            return response()->json([
                'success' => true,
                'source' => 'cache',
                'plan' => Cache::get($cacheKey),
            ]);
        }

        $plan = $this->generateLocalizedPlan($lang);

        Cache::put($cacheKey, $plan, 21600);

        return response()->json([
            'success' => true,
            'source' => 'api',
            'plan' => $plan,
        ]);
    }

    private function generateLocalizedPlan($lang)
    {
        $arabicDishes = [
            'breakfast' => ['فول مدمس', 'حمص بالطحينة', 'شكشوكة', 'لبنة بالزيت', 'معجنات'],
            'lunch' => ['مقلوبة', 'كبسة', 'مندي', 'مسخن', 'محشي', 'مجدرة', 'كفتة بالطحينة', 'ملوخية'],
            'dinner' => ['دجاج مشوي', 'سمك مقلي', 'كباب', 'شاورما', 'فتة دجاج', 'كوسا محشي', 'مسقعة'],
        ];

        $internationalDishes = [
            'breakfast' => ['Pancakes', 'Scrambled Eggs', 'Oatmeal', 'French Toast', 'Avocado Toast', 'Smoothie Bowl'],
            'lunch' => ['Grilled Chicken', 'Pasta Carbonara', 'Beef Tacos', 'Chicken Curry', 'Fish and Chips', 'Caesar Salad'],
            'dinner' => ['Steak', 'Salmon', 'Pizza', 'Burger', 'Sushi', 'Pad Thai', 'Lasagna'],
        ];

        $dishes = $lang === 'ar' ? $arabicDishes : $internationalDishes;

        $fullPlan = [];
        for ($i = 1; $i <= 7; $i++) {
            $dayLabel = $lang === 'ar' ? "اليوم {$i}" : "Day {$i}";

            $fullPlan[] = [
                'day' => $dayLabel,
                'breakfast' => $this->fetchMealByNameOrFallback(
                    $dishes['breakfast'][array_rand($dishes['breakfast'])],
                    $lang
                ),
                'lunch' => $this->fetchMealByNameOrFallback(
                    $dishes['lunch'][array_rand($dishes['lunch'])],
                    $lang
                ),
                'dinner' => $this->fetchMealByNameOrFallback(
                    $dishes['dinner'][array_rand($dishes['dinner'])],
                    $lang
                ),
            ];
        }

        return $fullPlan;
    }

    private function fetchMealByNameOrFallback($dishName, $lang)
    {
        try {
            $res = Http::timeout(6)->get('https://www.themealdb.com/api/json/v1/1/search.php', [
                's' => $dishName
            ]);

            if ($res->ok() && isset($res->json()['meals']) && $res->json()['meals']) {
                return $this->normalizeMealdb($res->json()['meals'][0]);
            }

            $random = Http::timeout(5)->get('https://www.themealdb.com/api/json/v1/1/random.php');
            if ($random->ok() && isset($random->json()['meals'][0])) {
                return $this->normalizeMealdb($random->json()['meals'][0]);
            }
        } catch (\Exception $e) {
            Log::warning('TheMealDB error: ' . $e->getMessage());
        }

        return $this->getFallbackMeal($dishName, $lang);
    }

    private function normalizeMealdb(array $m)
    {
        $ings = [];
        for ($i = 1; $i <= 20; $i++) {
            $ing = trim($m["strIngredient{$i}"] ?? '');
            $meas = trim($m["strMeasure{$i}"] ?? '');
            if ($ing !== '' && $ing !== null && strtolower($ing) !== 'null') {
                $ings[] = trim(($meas ? $meas . ' ' : '') . $ing);
            }
        }

        return [
            'id' => $m['idMeal'] ?? uniqid(),
            'idMeal' => $m['idMeal'] ?? uniqid(),
            'name' => $m['strMeal'] ?? 'Delicious Meal',
            'strMeal' => $m['strMeal'] ?? 'Delicious Meal',
            'image' => $m['strMealThumb'] ?? 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop',
            'strMealThumb' => $m['strMealThumb'] ?? 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop',
            'ingredients' => $ings,
            'instructions' => $m['strInstructions'] ?? 'Cook with love and enjoy!',
            'strInstructions' => $m['strInstructions'] ?? 'Cook with love and enjoy!',
            'category' => $m['strCategory'] ?? 'Main Course',
            'strCategory' => $m['strCategory'] ?? 'Main Course',
            'area' => $m['strArea'] ?? 'International',
            'strArea' => $m['strArea'] ?? 'International',
            'youtube' => $m['strYoutube'] ?? null,
            'strYoutube' => $m['strYoutube'] ?? null,
            'strSource' => $m['strSource'] ?? null,
            'source' => 'themealdb',
        ];
    }

    private function getFallbackMeal($dishName, $lang)
    {
        return [
            'id' => uniqid(),
            'idMeal' => uniqid(),
            'name' => $dishName,
            'strMeal' => $dishName,
            'image' => 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop',
            'strMealThumb' => 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop',
            'ingredients' => [
                $lang === 'ar' ? 'مكونات متنوعة' : 'Various ingredients',
                $lang === 'ar' ? 'توابل' : 'Spices',
                $lang === 'ar' ? 'زيت' : 'Oil',
            ],
            'instructions' => $lang === 'ar'
                ? 'طريقة تحضير سهلة ولذيذة. استمتع بوجبتك!'
                : 'Easy and delicious preparation. Enjoy your meal!',
            'strInstructions' => $lang === 'ar'
                ? 'طريقة تحضير سهلة ولذيذة. استمتع بوجبتك!'
                : 'Easy and delicious preparation. Enjoy your meal!',
            'category' => $lang === 'ar' ? 'طبق رئيسي' : 'Main Course',
            'strCategory' => $lang === 'ar' ? 'طبق رئيسي' : 'Main Course',
            'area' => $lang === 'ar' ? 'عربي' : 'Arabic',
            'strArea' => $lang === 'ar' ? 'عربي' : 'Arabic',
            'youtube' => null,
            'strYoutube' => null,
            'strSource' => null,
            'source' => 'fallback',
        ];
    }
}
