<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class AiRecipesController extends Controller
{
    public function index(Request $request)
    {
        $key = 'ai_recipes_daily_v1';
        $data = Cache::get($key);

        if ($data) {
            return response()->json($data);
        }

        return response()->json([
            'updated_at' => now()->toISOString(),
            'recipes' => $this->sampleRecipes('en'),
        ]);
    }

    public function generate(Request $request)
    {
        $lang = $request->input('lang', 'en') === 'ar' ? 'ar' : 'en';
        $openaiKey = env('OPENAI_API_KEY');

        if (!$openaiKey) {
            return response()->json(['error' => 'OpenAI API key missing.'], 500);
        }

        $userPrompt = $lang === 'ar'
            ? "أنت مُنشئ وصفات. أنشئ 4 وصفات قصيرة ومتنوعة بالعربية. أعد استجابة JSON فقط كمصفوفة recipes[]. كل وصفة: {\"title\":\"\",\"desc\":\"\",\"time\":\"\",\"ingredients\":[{\"ingredient\":\"\",\"measure\":\"\"}],\"instructions\":\"\" }. لا تضع روابط صور."
            : "You are a recipe generator. Create 4 short diverse recipes in English. Return JSON only: an array named recipes, each item: { title, desc, time, ingredients: [{ingredient, measure}], instructions }. Do NOT include image URLs.";

        try {
            $resp = Http::withToken($openaiKey)
                ->timeout(30)
                ->post('https://api.openai.com/v1/chat/completions', [
                    'model' => 'gpt-4o-mini',
                    'messages' => [
                        ['role' => 'system', 'content' => 'You generate cooking recipes and return JSON only.'],
                        ['role' => 'user', 'content' => $userPrompt],
                    ],
                    'temperature' => 0.8,
                    'max_tokens' => 1200,
                ]);

            if (!$resp->successful()) {
                Log::error('OpenAI Error in generate: ' . $resp->body());
                return response()->json(['error' => 'OpenAI responded with error', 'details' => $resp->body()], 500);
            }

            $content = $resp->json('choices.0.message.content') ?? $resp->body();
            $json = $this->extractRecipesJson($content);

            if ($json === null || !is_array($json) || count($json) === 0) {
                Log::warning('Failed to extract recipes, using samples');
                $json = $this->sampleRecipes($lang);
            }

            $recipes = [];
            foreach ($json as $index => $r) {
                $title = $r['title'] ?? ($r['name'] ?? 'Recipe ' . ($index + 1));
                $ingredients = $r['ingredients'] ?? [];

                $realImage = $this->getRecipeImage($title, $ingredients, $lang);

                $recipes[] = [
                    'id' => (string) Str::uuid(),
                    'title' => $title,
                    'desc' => $r['desc'] ?? ($r['description'] ?? ''),
                    'image' => $realImage,
                    'time' => $r['time'] ?? ($r['prep_time'] ?? '—'),
                    'ingredients' => $ingredients,
                    'instructions' => $r['instructions'] ?? ($r['steps'] ?? ''),
                    'lang' => $lang,
                ];
            }

            $payload = [
                'updated_at' => now()->toISOString(),
                'recipes' => $recipes,
            ];

            Cache::put('ai_recipes_daily_v1', $payload, now()->addHours(24));

            return response()->json($payload);
        } catch (\Exception $e) {
            Log::error('Generate recipes error: ' . $e->getMessage());
            return response()->json(['error' => 'Server error generating recipes', 'details' => $e->getMessage()], 500);
        }
    }


    private function extractRecipesJson($content)
    {
        $try = trim($content);

        if (strpos($try, '{') === 0 || strpos($try, '[') === 0) {
            $decoded = json_decode($try, true);
            if ($decoded !== null) {
                if (isset($decoded['recipes']) && is_array($decoded['recipes'])) {
                    return $decoded['recipes'];
                } elseif (is_array($decoded)) {
                    return array_values($decoded);
                }
            }
        }

        if (preg_match('/\[\s*\{.*?\}\s*\]/s', $content, $matches)) {
            $decoded = json_decode($matches[0], true);
            if (is_array($decoded)) {
                return $decoded;
            }
        }

        if (preg_match_all('/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/s', $content, $matches)) {
            $arr = [];
            $matchesList = (is_array($matches) && isset($matches[0]) && is_array($matches[0])) ? $matches[0] : [];
            foreach ($matchesList as $m) {
                $d = json_decode($m, true);
                if (is_array($d) && (isset($d['title']) || isset($d['name']))) {
                    $arr[] = $d;
                }
            }
            if (count($arr) >= 1) {
                return $arr;
            }
        }

        return null;
    }
    private function getRecipeImage($title, $ingredients, $lang)
    {
        $pexelsImage = $this->fetchFromPexels($title, $ingredients, $lang);
        if ($pexelsImage) {
            Log::info("✅ Pexels image for: {$title}");
            return $pexelsImage;
        }

        $unsplashImage = $this->fetchFromUnsplash($title, $ingredients, $lang);
        if ($unsplashImage) {
            Log::info("✅ Unsplash image for: {$title}");
            return $unsplashImage;
        }

        $foodishImage = $this->fetchFromFoodish();
        if ($foodishImage) {
            Log::info("✅ Foodish image for: {$title}");
            return $foodishImage;
        }

        Log::warning("⚠️ All sources failed for: {$title}, using placeholder");
        return $this->getPlaceholderImage();
    }


    private function fetchFromPexels($title, $ingredients, $lang)
    {
        $pexelsKey = env('PEXELS_API_KEY');

        if (!$pexelsKey) {
            return null;
        }

        try {
            $keywords = $this->getSearchKeywords($title, $ingredients, $lang);

            $response = Http::timeout(10)
                ->withHeaders(['Authorization' => $pexelsKey])
                ->get('https://api.pexels.com/v1/search', [
                    'query' => $keywords,
                    'per_page' => 5,
                    'orientation' => 'landscape',
                ]);

            if ($response->successful()) {
                $photos = $response->json('photos') ?? [];

                if (!empty($photos)) {
                    $randomPhoto = $photos[array_rand($photos)];
                    return $randomPhoto['src']['large'] ?? $randomPhoto['src']['original'] ?? null;
                }
            }

            $response2 = Http::timeout(8)
                ->withHeaders(['Authorization' => $pexelsKey])
                ->get('https://api.pexels.com/v1/search', [
                    'query' => 'delicious food meal',
                    'per_page' => 5,
                ]);

            if ($response2->successful()) {
                $photos2 = $response2->json('photos') ?? [];
                if (!empty($photos2)) {
                    $randomPhoto2 = $photos2[array_rand($photos2)];
                    return $randomPhoto2['src']['large'] ?? null;
                }
            }
        } catch (\Exception $e) {
            Log::error('Pexels error: ' . $e->getMessage());
        }

        return null;
    }


    private function fetchFromUnsplash($title, $ingredients, $lang)
    {
        $unsplashKey = env('UNSPLASH_ACCESS_KEY');

        if (!$unsplashKey) {
            return null;
        }

        try {
            $keywords = $this->getSearchKeywords($title, $ingredients, $lang);

            $response = Http::timeout(10)
                ->get('https://api.unsplash.com/search/photos', [
                    'client_id' => $unsplashKey,
                    'query' => $keywords,
                    'per_page' => 5,
                    'orientation' => 'landscape',
                ]);

            if ($response->successful()) {
                $results = $response->json('results') ?? [];

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
                $results2 = $response2->json('results') ?? [];
                if (!empty($results2)) {
                    $randomResult2 = $results2[array_rand($results2)];
                    return $randomResult2['urls']['regular'] ?? null;
                }
            }
        } catch (\Exception $e) {
            Log::error('Unsplash error: ' . $e->getMessage());
        }

        return null;
    }


    private function fetchFromFoodish()
    {
        try {
            $response = Http::timeout(8)->get('https://foodish-api.com/api/');

            if ($response->successful()) {
                $data = $response->json();
                return $data['image'] ?? null;
            }
        } catch (\Exception $e) {
            Log::error('Foodish error: ' . $e->getMessage());
        }

        return null;
    }


    private function getSearchKeywords($title, $ingredients, $lang)
    {
        $cacheKey = 'keywords_' . md5($title);

        if (Cache::has($cacheKey)) {
            return Cache::get($cacheKey);
        }

        $openaiKey = env('OPENAI_API_KEY');

        if (!$openaiKey) {
            return $this->fallbackKeywords($title);
        }

        try {
            $ingredientsList = '';
            if (!empty($ingredients)) {
                $ingredientsList = "\nIngredients: " . implode(', ', array_column(array_slice($ingredients, 0, 3), 'ingredient'));
            }

            $prompt = "Recipe: {$title}{$ingredientsList}\n\nProvide 2-3 English keywords for food image search. Reply ONLY with keywords.\n\nExamples:\n- grilled chicken\n- pasta carbonara\n- chocolate cake";

            $resp = Http::withToken($openaiKey)
                ->timeout(8)
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
                $keywords = strtolower(str_replace(['"', "'", '.', ','], '', $keywords));

                Cache::put($cacheKey, $keywords, now()->addDays(7));
                return $keywords;
            }
        } catch (\Exception $e) {
            Log::warning('Keywords AI error: ' . $e->getMessage());
        }

        return $this->fallbackKeywords($title);
    }


    private function fallbackKeywords($title)
    {
        $words = preg_split('/[\s,،]+/', strtolower($title));
        $filtered = array_filter($words, function ($word) {
            return strlen($word) > 2;
        });

        $keywords = implode(' ', array_slice($filtered, 0, 3));

        if (empty($keywords)) {
            return 'delicious food';
        }

        return $keywords;
    }


    private function getPlaceholderImage()
    {
        $seeds = ['food', 'meal', 'dish', 'cuisine', 'tasty'];
        $randomSeed = $seeds[array_rand($seeds)] . rand(1, 999);

        return "https://picsum.photos/seed/{$randomSeed}/800/600";
    }

    private function sampleRecipes($lang = 'en')
    {
        if ($lang === 'ar') {
            return [
                [
                    'id' => (string) Str::uuid(),
                    'title' => 'سلطة الكينوا الحارة',
                    'desc' => 'سلطة منعشة مع الكينوا والخضروات',
                    'image' => $this->getRecipeImage('quinoa salad', [], 'en'),
                    'time' => '20 دقيقة',
                    'ingredients' => [
                        ['ingredient' => 'كينوا', 'measure' => '1 كوب'],
                        ['ingredient' => 'بندورة', 'measure' => '2 حبة'],
                    ],
                    'instructions' => 'اطهي الكينوا. قطّع الخضروات واخلطها.',
                    'lang' => 'ar',
                ],
                [
                    'id' => (string) Str::uuid(),
                    'title' => 'باستا بالطماطم',
                    'desc' => 'طبق إيطالي سريع',
                    'image' => $this->getRecipeImage('pasta tomato', [], 'en'),
                    'time' => '25 دقيقة',
                    'ingredients' => [
                        ['ingredient' => 'باستا', 'measure' => '400 غرام'],
                        ['ingredient' => 'طماطم', 'measure' => '400 غرام'],
                    ],
                    'instructions' => 'اسلقي الباستا. سخني الصلصة.',
                    'lang' => 'ar',
                ],
                [
                    'id' => (string) Str::uuid(),
                    'title' => 'دجاج مشوي',
                    'desc' => 'دجاج بنكهة الليمون',
                    'image' => $this->getRecipeImage('grilled chicken', [], 'en'),
                    'time' => '40 دقيقة',
                    'ingredients' => [
                        ['ingredient' => 'دجاج', 'measure' => '500 غرام'],
                        ['ingredient' => 'ليمون', 'measure' => '2 حبة'],
                    ],
                    'instructions' => 'تبّل الدجاج واشويه.',
                    'lang' => 'ar',
                ],
                [
                    'id' => (string) Str::uuid(),
                    'title' => 'شوربة العدس',
                    'desc' => 'شوربة صحية ودافئة',
                    'image' => $this->getRecipeImage('lentil soup', [], 'en'),
                    'time' => '35 دقيقة',
                    'ingredients' => [
                        ['ingredient' => 'عدس', 'measure' => '1 كوب'],
                        ['ingredient' => 'جزر', 'measure' => '2 حبة'],
                    ],
                    'instructions' => 'اقلي الخضار. أضف العدس والماء.',
                    'lang' => 'ar',
                ],
            ];
        }

        return [
            [
                'id' => (string) Str::uuid(),
                'title' => 'Spicy Quinoa Salad',
                'desc' => 'Fresh quinoa with vegetables',
                'image' => $this->getRecipeImage('quinoa salad', [], 'en'),
                'time' => '20 min',
                'ingredients' => [
                    ['ingredient' => 'Quinoa', 'measure' => '1 cup'],
                    ['ingredient' => 'Tomatoes', 'measure' => '2 pcs'],
                ],
                'instructions' => 'Cook quinoa. Chop vegetables and mix.',
                'lang' => 'en',
            ],
            [
                'id' => (string) Str::uuid(),
                'title' => 'Tomato Pasta',
                'desc' => 'Quick Italian pasta',
                'image' => $this->getRecipeImage('pasta tomato', [], 'en'),
                'time' => '25 min',
                'ingredients' => [
                    ['ingredient' => 'Pasta', 'measure' => '400g'],
                    ['ingredient' => 'Tomatoes', 'measure' => '400g'],
                ],
                'instructions' => 'Boil pasta. Heat sauce.',
                'lang' => 'en',
            ],
            [
                'id' => (string) Str::uuid(),
                'title' => 'Grilled Chicken',
                'desc' => 'Lemon flavored chicken',
                'image' => $this->getRecipeImage('grilled chicken', [], 'en'),
                'time' => '40 min',
                'ingredients' => [
                    ['ingredient' => 'Chicken', 'measure' => '500g'],
                    ['ingredient' => 'Lemon', 'measure' => '2 pcs'],
                ],
                'instructions' => 'Marinate and grill chicken.',
                'lang' => 'en',
            ],
            [
                'id' => (string) Str::uuid(),
                'title' => 'Lentil Soup',
                'desc' => 'Healthy warm soup',
                'image' => $this->getRecipeImage('lentil soup', [], 'en'),
                'time' => '35 min',
                'ingredients' => [
                    ['ingredient' => 'Lentils', 'measure' => '1 cup'],
                    ['ingredient' => 'Carrots', 'measure' => '2 pcs'],
                ],
                'instructions' => 'Sauté vegetables. Add lentils and water.',
                'lang' => 'en',
            ],
        ];
    }
}
