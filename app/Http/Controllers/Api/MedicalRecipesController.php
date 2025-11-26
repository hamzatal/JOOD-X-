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
    public function index(Request $request)
    {
        return response()->json([
            'success' => true,
            'data' => ['recipes' => [], 'pagination' => null]
        ]);
    }

    public function generate(Request $request)
    {
        $condition = $request->input('condition', 'general');
        $lang = $request->input('lang', 'en') === 'ar' ? 'ar' : 'en';
        $customRequest = $request->input('custom_request', null);

        Log::info("Generate: condition={$condition}, lang={$lang}");

        $openaiKey = env('OPENAI_API_KEY');

        if (!$openaiKey) {
            Log::error('OpenAI API key missing');
            return response()->json(['error' => 'OpenAI API key missing'], 500);
        }

        // بناء Prompts حسب الحالة
        $systemPrompt = $this->buildSystemPrompt($lang, $condition);
        $userPrompt = $this->buildUserPrompt($lang, $condition, $customRequest);

        try {
            Log::info('Calling OpenAI API...');

            $resp = Http::withToken($openaiKey)
                ->timeout(30)
                ->post('https://api.openai.com/v1/chat/completions', [
                    'model' => 'gpt-4o-mini',
                    'messages' => [
                        ['role' => 'system', 'content' => $systemPrompt],
                        ['role' => 'user', 'content' => $userPrompt],
                    ],
                    'temperature' => 0.9,
                    'max_tokens' => 2000,
                ]);

            if (!$resp->successful()) {
                Log::error('OpenAI error: ' . $resp->body());
                return response()->json(['error' => 'OpenAI API error', 'details' => $resp->body()], 500);
            }

            $content = $resp->json('choices.0.message.content') ?? $resp->body();

            Log::info('OpenAI responded, extracting JSON...');

            // استخراج JSON
            $recipesJson = $this->extractRecipesJson($content);

            if (!$recipesJson || !is_array($recipesJson) || count($recipesJson) === 0) {
                Log::error('Failed to extract recipes JSON');
                return response()->json(['error' => 'Failed to parse recipes'], 500);
            }

            Log::info('Extracted ' . count($recipesJson) . ' recipes');

            // معالجة الوصفات وإضافة الصور
            $recipes = [];
            foreach (array_slice($recipesJson, 0, 5) as $r) {
                $title = $r['title'] ?? ($r['name'] ?? 'Untitled Recipe');
                $ingredients = $r['ingredients'] ?? [];

                // الحصول على صورة دقيقة
                $image = $this->getRecipeImage($title, $ingredients);

                $recipes[] = [
                    'id' => (string) Str::uuid(),
                    'title' => $title,
                    'desc' => $r['description'] ?? ($r['desc'] ?? ''),
                    'ingredients' => $ingredients,
                    'instructions' => is_array($r['instructions'] ?? null)
                        ? implode("\n", $r['instructions'])
                        : ($r['instructions'] ?? $r['steps'] ?? ''),
                    'time' => $r['prep_time'] ?? $r['time'] ?? '25 min',
                    'servings' => $r['servings'] ?? 2,
                    'difficulty' => $r['difficulty'] ?? 'easy',
                    'calories' => $r['calories'] ?? ($r['nutrition']['calories'] ?? rand(250, 400)),
                    'protein' => $r['protein'] ?? ($r['nutrition']['protein'] ?? rand(20, 35) . 'g'),
                    'carbs' => $r['carbs'] ?? ($r['nutrition']['carbs'] ?? rand(20, 50) . 'g'),
                    'fat' => $r['fat'] ?? ($r['nutrition']['fat'] ?? rand(8, 18) . 'g'),
                    'benefits' => $r['benefits'] ?? ($r['medical_benefits'] ?? ''),
                    'image' => $image,
                    'lang' => $lang,
                    'condition' => $condition,
                ];
            }

            Log::info('Successfully prepared ' . count($recipes) . ' recipes with images');

            return response()->json([
                'success' => true,
                'data' => [
                    'recipes' => $recipes,
                    'pagination' => null
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Generate exception: ' . $e->getMessage());
            Log::error('Stack: ' . $e->getTraceAsString());
            return response()->json(['error' => 'Server error', 'details' => $e->getMessage()], 500);
        }
    }

    public function getNutritionTips(Request $request)
    {
        $condition = $request->query('condition', 'general');
        $lang = $request->query('lang', 'en');

        Log::info("Getting tips: condition={$condition}, lang={$lang}");

        $openaiKey = env('OPENAI_API_KEY');

        if (!$openaiKey) {
            return response()->json(['error' => 'OpenAI API key missing'], 500);
        }

        try {
            $prompt = $lang === 'ar'
                ? "أعطني 6 نصائح غذائية مهمة ودقيقة لمرضى {$condition}. أعِد JSON array فقط بدون أي نص آخر: [\"نصيحة 1\", \"نصيحة 2\", \"نصيحة 3\", \"نصيحة 4\", \"نصيحة 5\", \"نصيحة 6\"]"
                : "Give me 6 important precise nutrition tips for {$condition} patients. Return ONLY JSON array: [\"tip 1\", \"tip 2\", \"tip 3\", \"tip 4\", \"tip 5\", \"tip 6\"]";

            $resp = Http::withToken($openaiKey)
                ->timeout(15)
                ->post('https://api.openai.com/v1/chat/completions', [
                    'model' => 'gpt-4o-mini',
                    'messages' => [
                        ['role' => 'system', 'content' => 'You are a medical nutrition expert. Return ONLY JSON array.'],
                        ['role' => 'user', 'content' => $prompt],
                    ],
                    'temperature' => 0.8,
                    'max_tokens' => 400,
                ]);

            if (!$resp->successful()) {
                Log::error('Tips API error: ' . $resp->body());
                return response()->json(['error' => 'Failed to get tips'], 500);
            }

            $content = $resp->json('choices.0.message.content');

            // استخراج JSON
            $tips = json_decode($content, true);

            if (!$tips) {
                preg_match('/\[.*?\]/s', $content, $m);
                if (isset($m[0])) {
                    $tips = json_decode($m[0], true);
                }
            }

            if (!$tips || !is_array($tips)) {
                Log::error('Failed to parse tips JSON');
                return response()->json(['error' => 'Failed to parse tips'], 500);
            }

            Log::info('Successfully got ' . count($tips) . ' tips');

            return response()->json([
                'success' => true,
                'tips' => array_slice($tips, 0, 6)
            ]);
        } catch (\Exception $e) {
            Log::error('Tips exception: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function chatbot(Request $request)
    {
        $message = $request->input('message');
        $lang = $request->input('lang', 'en');

        $openaiKey = env('OPENAI_API_KEY');

        if (!$openaiKey) {
            return response()->json(['error' => 'API key missing'], 500);
        }

        try {
            $response = Http::withToken($openaiKey)
                ->timeout(20)
                ->post("https://api.openai.com/v1/chat/completions", [
                    "model" => "gpt-4o-mini",
                    "messages" => [
                        ["role" => "system", "content" => "You are a helpful nutrition assistant. Be brief and helpful."],
                        ["role" => "user", "content" => $message]
                    ],
                    "max_tokens" => 400,
                    "temperature" => 0.7
                ]);

            if ($response->successful()) {
                return response()->json([
                    'success' => true,
                    'message' => $response->json('choices.0.message.content')
                ]);
            }

            return response()->json(['error' => 'Failed'], 503);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getConditions(Request $request)
    {
        $lang = $request->query('lang', 'en');

        return response()->json([
            'success' => true,
            'conditions' => [
                ['id' => 'general', 'name' => $lang === 'ar' ? 'عام' : 'General', 'icon' => '🍽️'],
                ['id' => 'kidney', 'name' => $lang === 'ar' ? 'الكلى' : 'Kidney', 'icon' => '🫘'],
                ['id' => 'heart', 'name' => $lang === 'ar' ? 'القلب' : 'Heart', 'icon' => '❤️'],
                ['id' => 'diabetes', 'name' => $lang === 'ar' ? 'السكري' : 'Diabetes', 'icon' => '🩸'],
                ['id' => 'pressure', 'name' => $lang === 'ar' ? 'الضغط' : 'Pressure', 'icon' => '💊'],
                ['id' => 'colon', 'name' => $lang === 'ar' ? 'القولون' : 'Digestive', 'icon' => '🌿'],
                ['id' => 'weight', 'name' => $lang === 'ar' ? 'الوزن' : 'Weight', 'icon' => '⚖️']
            ]
        ]);
    }

    // ========== HELPER METHODS ==========

    private function buildSystemPrompt($lang, $condition)
    {
        $medicalRules = [
            'kidney' => [
                'ar' => "أنت خبير تغذية علاجية متخصص في أمراض الكلى. القواعد الطبية: ممنوع البوتاسيوم العالي (موز، بطاطس، طماطم، سبانخ)، ممنوع الفسفور (حليب، أجبان، لحوم حمراء)، ممنوع الملح تمامًا، بروتين قليل (15-20g).",
                'en' => "You are a kidney disease nutrition expert. Medical rules: NO high potassium (bananas, potatoes, tomatoes, spinach), NO phosphorus (dairy, cheese, red meat), NO salt, low protein (15-20g)."
            ],
            'heart' => [
                'ar' => "أنت خبير تغذية القلب. ممنوع الدهون المشبعة، ممنوع الزبدة، ممنوع اللحوم الحمراء. استخدم زيت زيتون وسمك.",
                'en' => "You are a heart health expert. NO saturated fats, NO butter, NO red meat. Use olive oil and fish."
            ],
            'diabetes' => [
                'ar' => "أنت خبير تغذية السكري. ممنوع السكر نهائيًا، ممنوع الأرز الأبيض، كربوهيدرات قليلة جدًا (أقل من 30g).",
                'en' => "You are a diabetes expert. NO sugar at all, NO white rice, very low carbs (less than 30g)."
            ],
            'general' => [
                'ar' => "أنت خبير تغذية صحية. أنشئ وصفات متوازنة وصحية ولذيذة.",
                'en' => "You are a healthy nutrition expert. Create balanced, healthy and delicious recipes."
            ]
        ];

        $rule = $medicalRules[$condition][$lang] ?? $medicalRules['general'][$lang];

        return $rule . ($lang === 'ar'
            ? " أعِد JSON فقط كمصفوفة بدون أي نص آخر. كل وصفة تحتوي على: title, description, ingredients (array), instructions, time, servings."
            : " Return ONLY JSON array without any other text. Each recipe: title, description, ingredients (array), instructions, time, servings.");
    }

    private function buildUserPrompt($lang, $condition, $customRequest)
    {
        $custom = $customRequest ? " - {$customRequest}" : "";

        if ($lang === 'ar') {
            return "أنشئ 5 وصفات طبية مختلفة تمامًا للحالة: {$condition}{$custom}. كل وصفة يجب أن تكون فريدة ومختلفة 100%. أعِد JSON فقط بهذا الشكل بالضبط:
[{\"title\":\"اسم الوصفة\",\"description\":\"وصف قصير\",\"time\":\"25 دقيقة\",\"servings\":2,\"difficulty\":\"easy\",\"ingredients\":[\"مكون 1\",\"مكون 2\"],\"instructions\":\"خطوات التحضير بالتفصيل\"}]";
        }

        return "Generate 5 completely different medical recipes for: {$condition}{$custom}. Each must be 100% unique. Return ONLY JSON in exactly this format:
[{\"title\":\"Recipe Name\",\"description\":\"Short desc\",\"time\":\"25 min\",\"servings\":2,\"difficulty\":\"easy\",\"ingredients\":[\"ingredient 1\",\"ingredient 2\"],\"instructions\":\"Detailed preparation steps\"}]";
    }

    private function extractRecipesJson($content)
    {
        $trim = trim($content);

        // محاولة 1: Direct decode
        if (strpos($trim, '{') === 0 || strpos($trim, '[') === 0) {
            $decoded = json_decode($trim, true);
            if (json_last_error() === JSON_ERROR_NONE) {
                if (isset($decoded['recipes'])) return $decoded['recipes'];
                if (is_array($decoded)) return array_values($decoded);
            }
        }

        // محاولة 2: من markdown
        if (preg_match('/``````/s', $content, $m)) {
            $decoded = json_decode($m[1], true);
            if (json_last_error() === JSON_ERROR_NONE) return $decoded;
        }

        // محاولة 3: أي JSON array
        if (preg_match('/\[\s*\{.*?\}\s*\]/s', $content, $m)) {
            $decoded = json_decode($m[0], true);
            if (json_last_error() === JSON_ERROR_NONE) return $decoded;
        }

        // محاولة 4: استخراج objects منفردة
        if (preg_match_all('/\{(?:[^{}]|(?R))*\}/s', $content, $matches)) {
            $arr = [];
            foreach ($matches[0] as $m) {
                $d = json_decode($m, true);
                if (is_array($d) && (isset($d['title']) || isset($d['name']))) {
                    $arr[] = $d;
                }
            }
            if (count($arr) > 0) return $arr;
        }

        return null;
    }

    private function getRecipeImage($title, $ingredients)
    {
        $keywords = $this->buildSmartKeywords($title, $ingredients);

        $pexels = $this->fetchFromPexels($keywords);
        if ($pexels) return $pexels;

        $unsplash = $this->fetchFromUnsplash($keywords);
        if ($unsplash) return $unsplash;

        return "https://source.unsplash.com/800x600/?food," . urlencode($title);
    }

    private function buildSmartKeywords($title, $ingredients)
    {
        $keywords = [];

    
        $cleanTitle = trim(strtolower($title));
        $cleanTitle = str_replace(['وصفة', 'recipe', 'healthy', 'صحي'], '', $cleanTitle);

        $translate = [
            'منسف' => 'jordian mansaf lamb rice',
            'كبسة' => 'kabsa saudi spiced rice chicken',
            'مقلوبة' => 'maqluba palestinian rice vegetables',
            'شوربة' => 'soup bowl hot',
            'سلطة' => 'fresh salad vegetables',
            'مشوي' => 'grilled',
            'محشي' => 'stuffed vegetables rice'
        ];

        foreach ($translate as $ar => $en) {
            if (str_contains($cleanTitle, $ar)) {
                $keywords[] = $en;
            }
        }

        $keywords[] = $cleanTitle;

        if (is_array($ingredients)) {
            foreach (array_slice($ingredients, 0, 4) as $ing) {
                if (is_array($ing)) {
                    $item = strtolower($ing['item'] ?? ($ing['ingredient'] ?? ''));
                } else {
                    $item = strtolower($ing);
                }

                if ($item && strlen($item) > 2) {
                    $keywords[] = $item;
                }
            }
        }

        $keywords[] = "healthy food";
        $keywords[] = "high quality";
        $keywords[] = "top view";

        return implode(' ', array_unique(array_filter($keywords)));
    }

    private function getSearchKeywords($title, $ingredients)
    {
        $parts = [$title];

        if (!empty($ingredients) && is_array($ingredients)) {
            $first = array_slice($ingredients, 0, 3);
            foreach ($first as $it) {
                if (is_array($it)) {
                    $parts[] = $it['ingredient'] ?? $it['item'] ?? '';
                } else {
                    $parts[] = (string)$it;
                }
            }
        }

        $keywords = implode(' ', array_filter(array_map('trim', $parts)));

        $translations = [
            'دجاج' => 'chicken',
            'سمك' => 'fish',
            'لحم' => 'beef',
            'سلطة' => 'salad',
            'شوربة' => 'soup',
            'أرز' => 'rice',
            'خضار' => 'vegetables',
            'مشوي' => 'grilled'
        ];

        foreach ($translations as $ar => $en) {
            $keywords = str_replace($ar, $en, $keywords);
        }

        return trim(substr($keywords, 0, 200));
    }

    private function fetchFromPexels($keywords)
    {
        $key = env('PEXELS_API_KEY');
        if (!$key) return null;

        try {
            $response = Http::withHeaders([
                'Authorization' => $key
            ])->timeout(10)->get("https://api.pexels.com/v1/search", [
                'query' => $keywords,
                'per_page' => 10,
                'orientation' => 'landscape'
            ]);

            if ($response->successful() && !empty($response->json('photos'))) {
                $photos = $response->json('photos');
                $pick = $photos[array_rand($photos)];
                return $pick['src']['large'] ?? $pick['src']['medium'] ?? null;
            }
        } catch (\Exception $e) {
            Log::warning("Pexels error: " . $e->getMessage());
        }

        return null;
    }

    private function fetchFromUnsplash($keywords)
    {
        $key = env('UNSPLASH_ACCESS_KEY');
        if (!$key) return null;

        try {
            $response = Http::timeout(10)->get("https://api.unsplash.com/search/photos", [
                'query' => $keywords,
                'orientation' => 'landscape',
                'content_filter' => 'high',
                'per_page' => 10,
                'client_id' => $key
            ]);

            $results = $response->json('results') ?? [];

            if (!empty($results)) {
                $pick = $results[array_rand($results)];
                return $pick['urls']['regular'] ?? null;
            }
        } catch (\Exception $e) {
            Log::warning("Unsplash error: " . $e->getMessage());
        }

        return null;
    }
}
