<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

class PopularRecipesController extends Controller
{
    public function index()
    {
        try {
            $recipes = Cache::remember('popular_recipes', 21000, function () {
                $meals = [];

                // Fetch 12 random popular recipes
                for ($i = 0; $i < 12; $i++) {
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
