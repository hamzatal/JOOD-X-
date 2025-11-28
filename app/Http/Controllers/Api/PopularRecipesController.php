<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Http\Request;

class PopularRecipesController extends Controller
{
    public function index(Request $request)
    {
        try {
            $lang = $request->get('lang', 'en');
            $refresh = $request->get('refresh', 'false');

            $cacheKey = "popular_meals_{$lang}";

            if ($refresh === 'true') {
                Cache::forget($cacheKey);
            }

            $recipes = Cache::remember($cacheKey, 21600, function () use ($lang) {
                $meals = [];
                $ids = [];

                for ($i = 0; $i < 40; $i++) {
                    $res = Http::get("https://www.themealdb.com/api/json/v1/1/random.php");

                    if ($res->ok() && isset($res->json()['meals'][0])) {
                        $meal = $res->json()['meals'][0];

                        if (in_array($meal['idMeal'], $ids)) continue;
                        if (!$this->isHalal($meal)) continue;

                        $ids[] = $meal['idMeal'];
                        $meals[] = $meal;

                        if (count($meals) >= 12) break;
                    }
                }

                return $meals;
            });

            foreach ($recipes as &$recipe) {
                if ($lang === 'ar') {
                    $recipe = $this->translate($recipe);
                }
            }

            return response()->json(['recipes' => $recipes]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    private function isHalal($meal)
    {
        $forbidden = ['pork', 'bacon', 'ham', 'wine', 'beer', 'alcohol'];
        $text = strtolower(json_encode($meal));

        foreach ($forbidden as $word) {
            if (strpos($text, $word) !== false) {
                return false;
            }
        }

        return true;
    }

    private function translate($meal)
    {
        $cats = [
            'Beef' => 'لحم بقر',
            'Chicken' => 'دجاج',
            'Dessert' => 'حلويات',
            'Lamb' => 'لحم خروف',
            'Pasta' => 'معكرونة',
            'Seafood' => 'مأكولات بحرية',
        ];

        $areas = [
            'American' => 'أمريكي',
            'British' => 'بريطاني',
            'Chinese' => 'صيني',
            'Egyptian' => 'مصري',
            'Indian' => 'هندي',
            'Italian' => 'إيطالي',
            'Mexican' => 'مكسيكي',
            'Turkish' => 'تركي',
        ];

        $meal['categoryAr'] = $cats[$meal['strCategory']] ?? $meal['strCategory'];
        $meal['areaAr'] = $areas[$meal['strArea']] ?? $meal['strArea'];

        return $meal;
    }
}
