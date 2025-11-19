<?php

namespace App\Http\Controllers\Api;

use Illuminate\Support\Facades\Http;
use App\Http\Controllers\Controller;

class TrendingRecipesController extends Controller
{
    public function index()
    {
        try {
            $key = env("SPOONACULAR_KEY");

            $response = Http::get("https://api.spoonacular.com/recipes/random", [
                "apiKey" => $key,
                "number" => 15
            ]);

            if ($response->failed()) {
                return response()->json(["recipes" => []]);
            }

            $recipes = collect($response->json()['recipes'] ?? [])
                ->sortByDesc(function ($r) {
                    return ($r['aggregateLikes'] ?? 0) + ($r['healthScore'] ?? 0);
                })
                ->take(6)
                ->values()
                ->all();

            return response()->json(["recipes" => $recipes]);
        } catch (\Exception $e) {
            return response()->json(["recipes" => []], 500);
        }
    }
}
