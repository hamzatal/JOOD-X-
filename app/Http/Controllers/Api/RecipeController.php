<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Client\Pool;

class RecipeController extends Controller
{
    public function index(Request $request)
    {
        $lang = $request->query('lang', 'en');
        $refresh = $request->query('refresh', 'false') === 'true';

        $cacheKey = "all_recipes_{$lang}";

        if ($refresh) {
            Cache::forget($cacheKey);
        }

        try {
            $recipes = Cache::remember($cacheKey, 3600, function () use ($lang) {
                return $this->fetchRandomRecipes($lang);
            });

            return response()->json(['recipes' => $recipes], 200);
        } catch (\Exception $e) {
            Log::error("Error index: " . $e->getMessage());
            return response()->json(['recipes' => []], 200);
        }
    }

    public function byCategory(Request $request, $category)
    {
        $lang = $request->query('lang', 'en');
        $refresh = $request->query('refresh', 'false') === 'true';

        $cacheKey = "recipes_category_{$category}_{$lang}";

        if ($refresh) {
            Cache::forget($cacheKey);
        }

        try {
            $recipes = Cache::remember($cacheKey, 3600, function () use ($category, $lang) {
                return $this->fetchRecipesByCategory($category, $lang);
            });

            return response()->json(['recipes' => $recipes], 200);
        } catch (\Exception $e) {
            Log::error("Error byCategory: " . $e->getMessage());
            return response()->json(['recipes' => []], 200);
        }
    }

    public function search(Request $request)
    {
        $query = $request->query('query', '');
        $lang = $request->query('lang', 'en');

        if (!$query) {
            return response()->json(['recipes' => []], 200);
        }

        try {
            $response = Http::timeout(10)->get("https://www.themealdb.com/api/json/v1/1/search.php?s={$query}");

            if ($response->successful()) {
                $meals = $response->json('meals', []);
                if (!$meals) return response()->json(['recipes' => []], 200);

                $filtered = array_filter($meals, fn($meal) => $this->isHalal($meal));

                if ($lang === 'ar') {
                    $filtered = array_map(fn($meal) => $this->translateBasicMeal($meal), $filtered);
                }

                return response()->json(['recipes' => array_values($filtered)], 200);
            }

            return response()->json(['recipes' => []], 200);
        } catch (\Exception $e) {
            Log::error("Search error: " . $e->getMessage());
            return response()->json(['recipes' => []], 200);
        }
    }

    private function fetchRandomRecipes($lang)
    {
        try {
            $responses = Http::pool(
                fn(Pool $pool) =>
                collect(range(1, 20))->map(
                    fn() => $pool->timeout(5)->get('https://www.themealdb.com/api/json/v1/1/random.php')
                )->toArray()
            );

            $recipes = [];
            foreach ($responses as $r) {
                if ($r->successful()) {
                    $meal = $r->json('meals.0');
                    if ($meal && $this->isHalal($meal)) {
                        if ($lang === 'ar') {
                            $meal = $this->translateBasicMeal($meal);
                        }
                        $recipes[] = $meal;
                        if (count($recipes) >= 15) break;
                    }
                }
            }

            return $recipes;
        } catch (\Exception $e) {
            Log::error("fetchRandomRecipes: " . $e->getMessage());
            return [];
        }
    }

    private function fetchRecipesByCategory($category, $lang)
    {
        try {
            $response = Http::timeout(10)
                ->get("https://www.themealdb.com/api/json/v1/1/filter.php?c={$category}");

            if ($response->failed()) return [];

            $meals = $response->json('meals', []);
            if (!$meals) return [];

            $selected = collect($meals)->shuffle()->take(20)->toArray();
            $ids = array_column($selected, 'idMeal');

            $responses = Http::pool(
                fn(Pool $pool) =>
                collect($ids)->map(
                    fn($id) => $pool->timeout(6)->get("https://www.themealdb.com/api/json/v1/1/lookup.php?i={$id}")
                )->toArray()
            );

            $full = [];
            foreach ($responses as $r) {
                if ($r->successful()) {
                    $meal = $r->json('meals.0');
                    if ($meal && $this->isHalal($meal)) {
                        if ($lang === 'ar') {
                            $meal = $this->translateBasicMeal($meal);
                        }
                        $full[] = $meal;
                    }
                }
            }

            return $full;
        } catch (\Exception $e) {
            Log::error("fetchRecipesByCategory: " . $e->getMessage());
            return [];
        }
    }

    private function translateBasicMeal($meal)
    {
        $meal['strMealAr'] = $meal['strMeal'] ?? '';
        $meal['strCategoryAr'] = $this->translateBasic($meal['strCategory'] ?? '', 'category');
        $meal['strAreaAr'] = $this->translateBasic($meal['strArea'] ?? '', 'area');
        return $meal;
    }

    private function translateBasic($text, $type)
    {
        $dict = [
            'category' => [
                'Beef' => 'لحم بقر',
                'Chicken' => 'دجاج',
                'Dessert' => 'حلويات',
                'Pasta' => 'باستا',
                'Vegetarian' => 'نباتي',
                'Side' => 'طبق جانبي',
                'Breakfast' => 'فطور',
            ],
            'area' => [
                'Egyptian' => 'مصري',
                'Moroccan' => 'مغربي',
                'Turkish' => 'تركي',
            ],
        ];
        return $dict[$type][$text] ?? $text;
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
}
