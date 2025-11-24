<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class WhatToCookController extends Controller
{
    public function handle(Request $request)
    {
        $prompt = $request->input('prompt');
        $lang = $request->input('lang', 'en') === 'ar' ? 'ar' : 'en';

        if (!$prompt || trim($prompt) === '') {
            return response()->json(['error' => 'No prompt provided.'], 400);
        }

        $openaiKey = env('OPENAI_API_KEY');

        if (!$openaiKey) {
            return response()->json(['error' => 'OpenAI key missing.'], 500);
        }

        $system = $lang === 'ar'
            ? 'أنت مساعد طبخ. أعد JSON فقط: { "title":"", "description":"", "ingredients":[{"ingredient":"","measure":""}], "instructions":"" }'
            : 'You are a cooking assistant. Return JSON only: { "title":"", "description":"", "ingredients":[{"ingredient":"","measure":""}], "instructions":"" }';

        $userContent = ($lang === 'ar' ? "السؤال: " : "User request: ") . $prompt;

        try {
            $resp = Http::withToken($openaiKey)
                ->timeout(30)
                ->post('https://api.openai.com/v1/chat/completions', [
                    'model' => 'gpt-4o-mini',
                    'messages' => [
                        ['role' => 'system', 'content' => $system],
                        ['role' => 'user', 'content' => $userContent],
                    ],
                    'temperature' => 0.7,
                    'max_tokens' => 1000,
                ]);

            if (!$resp->successful()) {
                Log::error('OpenAI Error: ' . $resp->body());
                return response()->json(['error' => 'OpenAI error', 'details' => $resp->body()], 500);
            }

            $content = $resp->json('choices.0.message.content') ?? $resp->body();
            Log::info('OpenAI Response: ' . $content);

            $decoded = $this->extractJson($content);

            if (!$decoded || !is_array($decoded)) {
                return response()->json(['error' => 'Invalid JSON format', 'raw' => $content], 500);
            }

            $title = $decoded['title'] ?? ($decoded['name'] ?? 'Recipe');
            $ingredients = $decoded['ingredients'] ?? [];

            $finalImage = $this->getRecipeImage($title, $ingredients, $lang);

            Log::info("Final image URL for '{$title}': {$finalImage}");

            $normalized = [
                'title' => $title,
                'description' => $decoded['description'] ?? ($decoded['desc'] ?? ''),
                'image' => $finalImage,
                'ingredients' => $ingredients,
                'instructions' => $decoded['instructions'] ?? ($decoded['steps'] ?? ''),
            ];

            return response()->json(['recipe' => $normalized]);
        } catch (\Exception $e) {
            Log::error('WhatToCook Error: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            return response()->json(['error' => 'Server error', 'details' => $e->getMessage()], 500);
        }
    }


    private function getRecipeImage($title, $ingredients, $lang)
    {
        $pexelsImage = $this->fetchFromPexels($title, $ingredients, $lang);
        if ($pexelsImage) {
            Log::info("✅ Using Pexels image");
            return $pexelsImage;
        }

        $unsplashImage = $this->fetchFromUnsplash($title, $ingredients, $lang);
        if ($unsplashImage) {
            Log::info("✅ Using Unsplash image");
            return $unsplashImage;
        }

        $foodishImage = $this->fetchFromFoodish();
        if ($foodishImage) {
            Log::info("✅ Using Foodish image");
            return $foodishImage;
        }

        Log::warning("⚠️ All sources failed, using placeholder");
        return $this->getPlaceholderImage();
    }

    private function fetchFromPexels($title, $ingredients, $lang)
    {
        $pexelsKey = env('PEXELS_API_KEY');

        if (!$pexelsKey) {
            Log::warning('Pexels API key not found in .env');
            return null;
        }

        try {
            $keywords = $this->getSearchKeywords($title, $ingredients, $lang);

            Log::info("Pexels search query: '{$keywords}'");

            $response = Http::timeout(10)
                ->withHeaders([
                    'Authorization' => $pexelsKey
                ])
                ->get('https://api.pexels.com/v1/search', [
                    'query' => $keywords,
                    'per_page' => 5,
                    'orientation' => 'landscape',
                ]);

            if ($response->successful()) {
                $data = $response->json();
                Log::info('Pexels response: ' . json_encode($data));

                $photos = $data['photos'] ?? [];

                if (!empty($photos)) {
                    $randomPhoto = $photos[array_rand($photos)];
                    return $randomPhoto['src']['large'] ?? $randomPhoto['src']['original'] ?? null;
                }

                Log::warning("No photos found for query: {$keywords}");
            } else {
                Log::error('Pexels API error: ' . $response->body());
            }

            $generalQuery = $lang === 'ar' ? 'food dish meal' : 'delicious food dish';

            Log::info("Pexels fallback query: '{$generalQuery}'");

            $response2 = Http::timeout(8)
                ->withHeaders([
                    'Authorization' => $pexelsKey
                ])
                ->get('https://api.pexels.com/v1/search', [
                    'query' => $generalQuery,
                    'per_page' => 5,
                ]);

            if ($response2->successful()) {
                $data2 = $response2->json();
                $photos2 = $data2['photos'] ?? [];

                if (!empty($photos2)) {
                    $randomPhoto2 = $photos2[array_rand($photos2)];
                    return $randomPhoto2['src']['large'] ?? $randomPhoto2['src']['original'] ?? null;
                }
            }
        } catch (\Exception $e) {
            Log::error('Pexels Exception: ' . $e->getMessage());
        }

        return null;
    }

    private function fetchFromUnsplash($title, $ingredients, $lang)
    {
        $unsplashKey = env('UNSPLASH_ACCESS_KEY');

        if (!$unsplashKey) {
            Log::warning('Unsplash API key not found in .env');
            return null;
        }

        try {
            $keywords = $this->getSearchKeywords($title, $ingredients, $lang);

            Log::info("Unsplash search query: '{$keywords}'");

            $response = Http::timeout(10)
                ->get('https://api.unsplash.com/search/photos', [
                    'client_id' => $unsplashKey,
                    'query' => $keywords,
                    'per_page' => 5,
                    'orientation' => 'landscape',
                ]);

            if ($response->successful()) {
                $data = $response->json();
                $results = $data['results'] ?? [];

                if (!empty($results)) {
                    $randomResult = $results[array_rand($results)];
                    return $randomResult['urls']['regular'] ?? null;
                }
            }

            $response2 = Http::timeout(8)
                ->get('https://api.unsplash.com/search/photos', [
                    'client_id' => $unsplashKey,
                    'query' => 'delicious food',
                    'per_page' => 5,
                ]);

            if ($response2->successful()) {
                $data2 = $response2->json();
                $results2 = $data2['results'] ?? [];

                if (!empty($results2)) {
                    $randomResult2 = $results2[array_rand($results2)];
                    return $randomResult2['urls']['regular'] ?? null;
                }
            }
        } catch (\Exception $e) {
            Log::error('Unsplash Exception: ' . $e->getMessage());
        }

        return null;
    }


    private function fetchFromFoodish()
    {
        try {
            Log::info('Trying Foodish API...');

            $response = Http::timeout(8)->get('https://foodish-api.com/api/');

            if ($response->successful()) {
                $data = $response->json();
                $imageUrl = $data['image'] ?? null;

                if ($imageUrl) {
                    Log::info("Foodish returned: {$imageUrl}");
                    return $imageUrl;
                }
            }
        } catch (\Exception $e) {
            Log::error('Foodish Exception: ' . $e->getMessage());
        }

        return null;
    }


    private function getSearchKeywords($title, $ingredients, $lang)
    {
        $cacheKey = 'search_keywords_' . md5($title . $lang);

        if (Cache::has($cacheKey)) {
            return Cache::get($cacheKey);
        }

        $openaiKey = env('OPENAI_API_KEY');

        try {
            $ingredientsList = '';
            if (!empty($ingredients)) {
                $ingredientsList = "\nMain ingredients: " . implode(', ', array_column(array_slice($ingredients, 0, 3), 'ingredient'));
            }

            $prompt = "Recipe title: {$title}{$ingredientsList}\n\nProvide 2-3 English keywords for searching a food image. Reply ONLY with keywords, no explanation.\n\nExamples:\n- grilled chicken\n- chocolate cake\n- pasta carbonara";

            $resp = Http::withToken($openaiKey)
                ->timeout(10)
                ->post('https://api.openai.com/v1/chat/completions', [
                    'model' => 'gpt-4o-mini',
                    'messages' => [
                        ['role' => 'user', 'content' => $prompt],
                    ],
                    'temperature' => 0.3,
                    'max_tokens' => 30,
                ]);

            if ($resp->successful()) {
                $keywords = trim($resp->json('choices.0.message.content') ?? '');
                $keywords = strtolower(str_replace(['"', "'", '.', ',', '!', '?'], '', $keywords));

                Cache::put($cacheKey, $keywords, now()->addDays(7));

                Log::info("AI generated keywords: '{$keywords}'");
                return $keywords;
            }
        } catch (\Exception $e) {
            Log::warning('Keywords AI error: ' . $e->getMessage());
        }

        $words = preg_split('/[\s,،]+/', strtolower($title));
        $filtered = array_filter($words, function ($word) {
            return strlen($word) > 2;
        });

        $keywords = implode(' ', array_slice($filtered, 0, 3));

        if (empty($keywords)) {
            return $lang === 'ar' ? 'arabic food' : 'delicious food';
        }

        return $keywords;
    }

    private function getPlaceholderImage()
    {
        $seeds = ['food', 'meal', 'dish', 'cuisine', 'delicious', 'tasty', 'yummy'];
        $randomSeed = $seeds[array_rand($seeds)] . rand(1, 999);

        return "https://picsum.photos/seed/{$randomSeed}/800/600";
    }

    private function extractJson($content)
    {
        $trimmed = trim($content);

        if (($trimmed[0] ?? '') === '{' || ($trimmed[0] ?? '') === '[') {
            $decoded = json_decode($trimmed, true);
            if ($decoded !== null) {
                return $decoded;
            }
        }

        if (preg_match('/```(?:json)?\s*(\{.*?\})\s*```/s', $content, $m)) {
            $decoded = json_decode($m[1], true);
            if ($decoded !== null) {
                return $decoded;
            }
        }

        if (preg_match('/\{(?:[^{}]|(?R))*\}/s', $content, $m)) {
            $decoded = json_decode($m[0], true);
            if ($decoded !== null) {
                return $decoded;
            }
        }

        return null;
    }
}
