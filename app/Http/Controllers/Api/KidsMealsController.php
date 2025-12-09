<?php
// app/Http/Controllers/Api/KidsMealsController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class KidsMealsController extends Controller
{
    public function index(Request $request)
    {
        $lang = $request->query('lang', 'en') === 'ar' ? 'ar' : 'en';
        $refresh = $request->query('refresh') === 'true' ? true : false;

        // Cache key
        $cacheKey = "kids_meals_v1_{$lang}";

        // ttl short: 6 hours (21600 sec)
        if (!$refresh && Cache::has($cacheKey)) {
            $cached = Cache::get($cacheKey);
            return response()->json(['recipes' => $cached]);
        }

        try {
            $meals = [];

            // Try to fetch 12 random meals and then filter/gather until we have enough
            $attempts = 0;
            while (count($meals) < 12 && $attempts < 20) {
                $attempts++;
                $res = Http::timeout(8)->get('https://www.themealdb.com/api/json/v1/1/random.php');
                if (!$res->ok()) continue;
                $row = $res->json('meals.0');
                if (!$row) continue;

                // Basic filter for "kid-friendly" by category or common simple meals
                $cat = strtolower($row['strCategory'] ?? '');
                $title = strtolower($row['strMeal'] ?? '');

                // allow if category suggests "Starter", "Side", "Breakfast", "Dessert" or if title has common kid words
                $kidKeywords = ['breakfast', 'sandwich', 'pancake', 'cake', 'cookie', 'pizza', 'omelette', 'muffin', 'pasta', 'macaroni', 'burger', 'pudding'];
                $isKid = false;
                if (in_array($cat, ['breakfast', 'side', 'dessert', 'starter'])) $isKid = true;
                foreach ($kidKeywords as $kw) {
                    if (strpos($title, $kw) !== false) $isKid = true;
                }
                // also accept many neutral meals to fill
                if (!$isKid && count($meals) < 6) $isKid = true;

                if (!$isKid) continue;

                // build ingredients array
                $ingredients = [];
                for ($i = 1; $i <= 20; $i++) {
                    $ing = trim($row["strIngredient{$i}"] ?? '');
                    $meas = trim($row["strMeasure{$i}"] ?? '');
                    if ($ing !== '' && $ing !== null) {
                        $ingredients[] = trim($meas . ' ' . $ing);
                    }
                }

                // prepare image using available fetchers
                $image = $row['strMealThumb'] ?? null;
                // try to get better image via Spoonacular/Pexels/Unsplash using meal name
                $query = $row['strMeal'];
                $img = $this->fetchBestImage($query);
                if ($img) $image = $img;

                $meals[] = [
                    'id' => $row['idMeal'] ?? uniqid(),
                    'title' => $row['strMeal'] ?? 'Recipe',
                    'titleAr' => null, // could be filled if you have AR mapping
                    'description' => $row['strArea'] . ' • ' . $row['strCategory'],
                    'category' => $row['strCategory'] ?? '',
                    'categoryAr' => null,
                    'area' => $row['strArea'] ?? '',
                    'areaAr' => null,
                    'time' => '30',
                    'servings' => 4,
                    'ingredients' => $ingredients,
                    'instructions' => $row['strInstructions'] ?? '',
                    'image' => $image,
                    'source' => $row['strSource'] ?? null,
                    'rating' => 4.7
                ];
            }

            // Cache for 6 hours
            Cache::put($cacheKey, $meals, 21600);

            return response()->json(['recipes' => $meals]);
        } catch (\Exception $e) {
            Log::error("KidsMealsController error: " . $e->getMessage());
            return response()->json(['recipes' => []], 500);
        }
    }

    // Use spoonacular -> pexels -> unsplash chain
    private function fetchBestImage($query)
    {
        $q = $this->prepareQuery($query);
        // try spoonacular
        $spoon = $this->fetchFromSpoonacular($q);
        if ($spoon) return $spoon;

        $pex = $this->fetchFromPexels($q);
        if ($pex) return $pex;

        $uns = $this->fetchFromUnsplash($q);
        if ($uns) return $uns;

        return null;
    }

    private function prepareQuery($q)
    {
        // remove arabic chars, special chars -> english keywords
        $q = preg_replace('/[\x{0600}-\x{06FF}]/u', '', $q);
        $q = preg_replace('/[^a-zA-Z0-9\s]/', ' ', $q);
        $q = trim(strtolower($q)) . ' food dish';
        return $q;
    }

    private function fetchFromSpoonacular($query)
    {
        $key = env('SPOONACULAR_API_KEY');
        if (!$key) return null;
        try {
            $res = Http::timeout(6)->get('https://api.spoonacular.com/recipes/complexSearch', [
                'apiKey' => $key,
                'query' => $query,
                'number' => 2,
                'addRecipeInformation' => true
            ]);
            if ($res->ok()) {
                $r = $res->json('results.0');
                if ($r && isset($r['image'])) return $r['image'];
            }
        } catch (\Exception $e) {
            Log::warning('Spoonacular fetch error: ' . $e->getMessage());
        }
        return null;
    }

    private function fetchFromPexels($query)
    {
        $key = env('PEXELS_API_KEY');
        if (!$key) return null;
        try {
            $res = Http::withHeaders(['Authorization' => $key])->timeout(6)->get('https://api.pexels.com/v1/search', [
                'query' => $query,
                'per_page' => 1,
                'orientation' => 'landscape'
            ]);
            if ($res->ok()) {
                $photos = $res->json('photos');
                if (!empty($photos) && isset($photos[0]['src']['large'])) {
                    return $photos[0]['src']['large'];
                }
            }
        } catch (\Exception $e) {
            Log::warning('Pexels fetch error: ' . $e->getMessage());
        }
        return null;
    }

    private function fetchFromUnsplash($query)
    {
        $key = env('UNSPLASH_ACCESS_KEY');
        if (!$key) return null;
        try {
            $res = Http::timeout(6)->get('https://api.unsplash.com/search/photos', [
                'query' => $query,
                'per_page' => 1,
                'client_id' => $key
            ]);
            if ($res->ok()) {
                $r = $res->json('results.0');
                if ($r && isset($r['urls']['regular'])) return $r['urls']['regular'];
            }
        } catch (\Exception $e) {
            Log::warning('Unsplash fetch error: ' . $e->getMessage());
        }
        return null;
    }
}
