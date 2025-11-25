<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class MedicalRecipesController extends Controller
{
    public function index()
    {
        $cacheKey = 'medical_recipes_daily_v1';

        if (Cache::has($cacheKey)) {
            return response()->json(Cache::get($cacheKey));
        }

        return response()->json([
            'updated_at' => null,
            'recipes' => [],
        ]);
    }

    public function generate(Request $request)
    {
        $lang = $request->input('lang', 'en') === 'ar' ? 'ar' : 'en';
        $condition = $request->input('condition', 'general');
        $openaiKey = env('OPENAI_API_KEY');

        if (!$openaiKey) {
            return response()->json(['error' => 'OpenAI key missing'], 500);
        }

        // 🎯 PROMPT جديد تمامًا ومخصص 100% لمرضى (كلى – قلب – ضغط – سكر – قولون – سمنة)
        $userPrompt = $this->buildPrompt($lang, $condition);

        try {
            $resp = Http::withToken($openaiKey)->timeout(40)->post(
                "https://api.openai.com/v1/chat/completions",
                [
                    "model" => "gpt-4o-mini",
                    "messages" => [
                        ["role" => "system", "content" => $this->systemPrompt($lang)],
                        ["role" => "user", "content" => $userPrompt],
                    ],
                    "max_tokens" => 1600,
                    "temperature" => 0.5
                ]
            );

            if (!$resp->successful()) {
                Log::error("MedicalRecipes OpenAI error: " . $resp->body());
                return response()->json(['error' => 'AI request failed'], 500);
            }

            $content = $resp->json('choices.0.message.content');
            $recipes = $this->extractRecipesJson($content);

            if (!$recipes) {
                return response()->json(['error' => 'Invalid recipe JSON'], 500);
            }

            // ====== FIX الصور هنا =======
            foreach ($recipes as &$recipe) {
                $title = $recipe['title'] ?? "healthy meal";
                $ingredients = $recipe['ingredients'] ?? [];

                $recipe['id'] = (string) Str::uuid();
                $recipe['image'] = $this->getRealImage($title, $ingredients);
                $recipe['lang'] = $lang;
            }

            $payload = [
                "updated_at" => now()->toISOString(),
                "recipes" => $recipes,
            ];

            Cache::put("medical_recipes_daily_v1", $payload, now()->addHours(24));

            return response()->json($payload);
        } catch (\Exception $e) {
            Log::error("MedicalRecipes fatal error: " . $e->getMessage());
            return response()->json(['error' => 'Server error'], 500);
        }
    }

    //━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🧠 System instructions (very strict medical rules)
    //━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    private function systemPrompt($lang)
    {
        return $lang === "ar"
            ? "أنت خبير تغذية متخصص في الوصفات العلاجية. يمنع استخدام الملح بكثرة. يمنع استخدام الدهون غير الصحية. جميع الوصفات يجب أن تكون مناسبة للحالات الطبية المختلفة، وتحتوي على قيم غذائية منخفضة الضرر."
            : "You are a medical nutrition specialist. All recipes must be medically safe, low-sodium, heart-friendly, kidney-safe, diabetes-safe, and gut-friendly.";
    }

    //━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // Prompt generator tailored to medical condition
    //━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    private function buildPrompt($lang, $condition)
    {
        $conditions = [
            "kidney" => "kidney-friendly, low potassium, low sodium",
            "heart" => "heart-friendly, low-fat, low-cholesterol",
            "diabetes" => "diabetes-safe, low carb, sugar-free",
            "pressure" => "low sodium, hypertension-friendly",
            "colon" => "gut-friendly, IBS-safe, low fodmap",
            "weight" => "low calories, weight loss friendly",
            "general" => "healthy balanced meal"
        ];

        $keywords = $conditions[$condition] ?? $conditions["general"];

        return $lang === "ar"
            ? "أنشئ 4 وصفات علاجية مناسبة لحالة: {$condition}. يجب أن تكون {$keywords}. أعِد JSON فقط: [{\"title\":\"\",\"desc\":\"\",\"time\":\"\",\"ingredients\":[{\"ingredient\":\"\",\"measure\":\"\"}],\"instructions\":\"\"}]. "
            : "Generate 4 medical-safe recipes for condition: {$condition}. Must be {$keywords}. Return ONLY JSON array.";
    }

    //━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // Extract JSON from AI safely
    //━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    private function extractRecipesJson($content)
    {
        if (!$content) return null;

        if (preg_match('/\[\s*\{.*?\}\s*\]/s', $content, $m)) {
            return json_decode($m[0], true);
        }

        return null;
    }

    //━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // IMAGE FETCHING
    //━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    private function getRealImage($title, $ingredients)
    {
        return
            $this->fetchPexels($title) ??
            $this->fetchUnsplash($title) ??
            $this->fetchFoodish() ??
            $this->placeholderImage();
    }

    private function fetchPexels($title)
    {
        $key = env('PEXELS_API_KEY');
        if (!$key) return null;

        try {
            $res = Http::withHeaders([
                "Authorization" => $key
            ])->get("https://api.pexels.com/v1/search", [
                "query" => $title,
                "per_page" => 3
            ]);

            $photos = $res->json('photos');

            if (!empty($photos)) {
                return $photos[0]['src']['medium'] ??
                    $photos[0]['src']['large'] ?? null;
            }
        } catch (\Exception $e) {
            return null;
        }

        return null;
    }

    private function fetchUnsplash($title)
    {
        $key = env('UNSPLASH_ACCESS_KEY');
        if (!$key) return null;

        try {
            $res = Http::get("https://api.unsplash.com/search/photos", [
                "client_id" => $key,
                "query" => $title,
                "per_page" => 3
            ]);

            $results = $res->json('results');

            if (!empty($results)) {
                return $results[0]['urls']['regular'] ?? null;
            }
        } catch (\Exception $e) {
            return null;
        }

        return null;
    }

    private function fetchFoodish()
    {
        try {
            $res = Http::get("https://foodish-api.com/api/");
            return $res->json('image') ?? null;
        } catch (\Exception $e) {
            return null;
        }
    }

    private function placeholderImage()
    {
        return "https://source.unsplash.com/featured/?healthy,food";
    }
}
