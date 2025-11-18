<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

class HeroTrendController extends Controller
{
    public function index()
    {
        try {
            $recipes = Cache::remember('hero_trending_meals', 21000, function () {

                $meals = [];

                for ($i = 0; $i < 10; $i++) {
                    $res = Http::get("https://www.themealdb.com/api/json/v1/1/random.php");

                    if ($res->ok() && isset($res->json()['meals'][0])) {
                        $meals[] = $res->json()['meals'][0];
                    }
                }

                return $meals;
            });

            return response()->json([
                "recipes" => $recipes
            ]);
        } catch (\Exception $e) {
            return response()->json([
                "error" => $e->getMessage()
            ], 500);
        }
    }
}
