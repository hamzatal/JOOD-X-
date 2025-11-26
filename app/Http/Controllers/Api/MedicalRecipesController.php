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

        // بناء Prompts محسّنة
        $systemPrompt = $this->buildSystemPrompt($lang, $condition);
        $userPrompt = $this->buildUserPrompt($lang, $condition, $customRequest);

        try {
            Log::info('Calling OpenAI API...');

            $resp = Http::withToken($openaiKey)
                ->timeout(40)
                ->post('https://api.openai.com/v1/chat/completions', [
                    'model' => 'gpt-4o-mini',
                    'messages' => [
                        ['role' => 'system', 'content' => $systemPrompt],
                        ['role' => 'user', 'content' => $userPrompt],
                    ],
                    'temperature' => 0.7, // خفّضت من 0.9 للدقة
                    'max_tokens' => 3000, // زودت الحد
                    'response_format' => ['type' => 'json_object'] // فورس JSON
                ]);

            if (!$resp->successful()) {
                Log::error('OpenAI error: ' . $resp->body());
                return response()->json(['error' => 'OpenAI API error', 'details' => $resp->body()], 500);
            }

            $content = $resp->json('choices.0.message.content') ?? '';

            Log::info('OpenAI responded: ' . substr($content, 0, 200));

            // استخراج JSON المحسّن
            $recipesData = $this->extractRecipesJson($content);

            if (!$recipesData || !isset($recipesData['recipes']) || count($recipesData['recipes']) === 0) {
                Log::error('Failed to extract recipes. Content: ' . $content);
                return response()->json(['error' => 'Failed to parse recipes'], 500);
            }

            $recipesJson = $recipesData['recipes'];
            Log::info('Extracted ' . count($recipesJson) . ' recipes');

            // معالجة الوصفات
            $recipes = [];
            foreach (array_slice($recipesJson, 0, 5) as $r) {
                // التأكد من وجود المكونات
                $ingredients = $r['ingredients'] ?? [];

                // تحويل المكونات لـ array بسيط إذا كانت objects
                $ingredientsArray = [];
                if (is_array($ingredients)) {
                    foreach ($ingredients as $ing) {
                        if (is_array($ing)) {
                            $ingredientsArray[] = $ing['item'] ?? $ing['ingredient'] ?? $ing['name'] ?? '';
                        } elseif (is_string($ing)) {
                            $ingredientsArray[] = $ing;
                        }
                    }
                }

                $title = $r['title'] ?? ($r['name'] ?? 'وصفة طبية');

                Log::info("Processing recipe: {$title} with " . count($ingredientsArray) . " ingredients");

                // الحصول على صورة دقيقة
                $image = $this->getRecipeImage($title, $ingredientsArray);

                // معالجة التعليمات
                $instructions = '';
                if (isset($r['instructions'])) {
                    if (is_array($r['instructions'])) {
                        $instructions = implode("\n", array_map(function ($step, $idx) use ($lang) {
                            $num = $idx + 1;
                            return ($lang === 'ar' ? "خطوة {$num}: " : "Step {$num}: ") . $step;
                        }, $r['instructions'], array_keys($r['instructions'])));
                    } else {
                        $instructions = $r['instructions'];
                    }
                } elseif (isset($r['steps'])) {
                    if (is_array($r['steps'])) {
                        $instructions = implode("\n", $r['steps']);
                    } else {
                        $instructions = $r['steps'];
                    }
                }

                $recipes[] = [
                    'id' => (string) Str::uuid(),
                    'title' => $title,
                    'desc' => $r['description'] ?? ($r['desc'] ?? ''),
                    'ingredients' => $ingredientsArray, // المكونات كـ array
                    'instructions' => $instructions,
                    'time' => $r['prep_time'] ?? ($r['time'] ?? '25-30 دقيقة'),
                    'servings' => $r['servings'] ?? 2,
                    'difficulty' => $r['difficulty'] ?? 'متوسط',
                    'calories' => $r['calories'] ?? ($r['nutrition']['calories'] ?? rand(200, 350)),
                    'protein' => $r['protein'] ?? ($r['nutrition']['protein'] ?? rand(15, 30) . 'g'),
                    'carbs' => $r['carbs'] ?? ($r['nutrition']['carbs'] ?? rand(20, 45) . 'g'),
                    'fat' => $r['fat'] ?? ($r['nutrition']['fat'] ?? rand(5, 15) . 'g'),
                    'benefits' => $r['benefits'] ?? ($r['medical_benefits'] ?? ''),
                    'image' => $image,
                    'lang' => $lang,
                    'condition' => $condition,
                ];
            }

            Log::info('Successfully prepared ' . count($recipes) . ' recipes');

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
                ? "أعطني 6 نصائح غذائية مهمة ودقيقة لمرضى {$condition}. أعِد JSON object بهذا الشكل: {\"tips\": [\"نصيحة 1\", \"نصيحة 2\", \"نصيحة 3\", \"نصيحة 4\", \"نصيحة 5\", \"نصيحة 6\"]}"
                : "Give me 6 important precise nutrition tips for {$condition} patients. Return JSON object: {\"tips\": [\"tip 1\", \"tip 2\", \"tip 3\", \"tip 4\", \"tip 5\", \"tip 6\"]}";

            $resp = Http::withToken($openaiKey)
                ->timeout(15)
                ->post('https://api.openai.com/v1/chat/completions', [
                    'model' => 'gpt-4o-mini',
                    'messages' => [
                        ['role' => 'system', 'content' => 'You are a medical nutrition expert. Return ONLY valid JSON.'],
                        ['role' => 'user', 'content' => $prompt],
                    ],
                    'temperature' => 0.6,
                    'max_tokens' => 500,
                    'response_format' => ['type' => 'json_object']
                ]);

            if (!$resp->successful()) {
                Log::error('Tips API error: ' . $resp->body());
                return response()->json(['error' => 'Failed to get tips'], 500);
            }

            $content = $resp->json('choices.0.message.content');
            $data = json_decode($content, true);

            $tips = $data['tips'] ?? [];

            if (empty($tips)) {
                Log::error('No tips found in response');
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
            $systemMsg = $lang === 'ar'
                ? "أنت مساعد تغذية طبية مفيد. كن مختصراً ومفيداً."
                : "You are a helpful medical nutrition assistant. Be brief and helpful.";

            $response = Http::withToken($openaiKey)
                ->timeout(20)
                ->post("https://api.openai.com/v1/chat/completions", [
                    "model" => "gpt-4o-mini",
                    "messages" => [
                        ["role" => "system", "content" => $systemMsg],
                        ["role" => "user", "content" => $message]
                    ],
                    "max_tokens" => 500,
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
                'ar' => "أنت خبير تغذية علاجية متخصص في أمراض الكلى.\n\nالقواعد الطبية الصارمة:\n- ممنوع البوتاسيوم العالي: (موز، بطاطس، طماطم، سبانخ، بطيخ)\n- ممنوع الفسفور: (حليب، أجبان، لحوم حمراء، مكسرات)\n- ممنوع الصوديوم والملح تماماً\n- بروتين قليل جداً: 15-20 جرام فقط\n- استخدم: أرز أبيض، خيار، تفاح، دجاج قليل",
                'en' => "You are a kidney disease nutrition expert.\n\nStrict medical rules:\n- NO high potassium: (bananas, potatoes, tomatoes, spinach, watermelon)\n- NO phosphorus: (dairy, cheese, red meat, nuts)\n- NO sodium/salt at all\n- Very low protein: 15-20g only\n- Use: white rice, cucumber, apple, minimal chicken"
            ],
            'heart' => [
                'ar' => "أنت خبير تغذية القلب والأوعية الدموية.\n\nقواعد صارمة:\n- ممنوع الدهون المشبعة والزبدة\n- ممنوع اللحوم الحمراء\n- ممنوع الملح\n- استخدم: سمك، زيت زيتون، خضار طازجة، شوفان",
                'en' => "You are a heart health nutrition expert.\n\nStrict rules:\n- NO saturated fats or butter\n- NO red meat\n- NO salt\n- Use: fish, olive oil, fresh vegetables, oats"
            ],
            'diabetes' => [
                'ar' => "أنت خبير تغذية مرضى السكري.\n\nقواعد صارمة:\n- ممنوع السكر نهائياً\n- ممنوع الأرز الأبيض والخبز الأبيض\n- كربوهيدرات قليلة جداً: أقل من 25 جرام\n- استخدم: خضار ورقية، بروتين، دهون صحية",
                'en' => "You are a diabetes nutrition expert.\n\nStrict rules:\n- NO sugar at all\n- NO white rice or white bread\n- Very low carbs: less than 25g\n- Use: leafy greens, protein, healthy fats"
            ],
            'pressure' => [
                'ar' => "أنت خبير تغذية الضغط.\n\nقواعد:\n- ممنوع الملح تماماً\n- ممنوع الأطعمة المعلبة\n- استخدم: خضار طازجة، فواكه، بقوليات",
                'en' => "You are a blood pressure expert.\n\nRules:\n- NO salt at all\n- NO canned foods\n- Use: fresh vegetables, fruits, legumes"
            ],
            'general' => [
                'ar' => "أنت خبير تغذية صحية. أنشئ وصفات متوازنة وصحية ولذيذة تحتوي على جميع العناصر الغذائية.",
                'en' => "You are a healthy nutrition expert. Create balanced, healthy and delicious recipes with all nutrients."
            ]
        ];

        $rule = $medicalRules[$condition][$lang] ?? $medicalRules['general'][$lang];

        $jsonInstructions = $lang === 'ar'
            ? "\n\nمهم جداً: أرجع JSON object فقط بهذا الشكل بالضبط:\n{\"recipes\": [{وصفة1}, {وصفة2}, ...]}\n\nكل وصفة يجب أن تحتوي على:\n- title: اسم الوصفة\n- description: وصف مختصر\n- ingredients: array من المكونات (strings بسيطة)\n- instructions: خطوات التحضير كـ string أو array\n- time: وقت التحضير\n- servings: عدد الحصص\n- difficulty: سهل/متوسط/صعب"
            : "\n\nVERY IMPORTANT: Return ONLY JSON object in this EXACT format:\n{\"recipes\": [{recipe1}, {recipe2}, ...]}\n\nEach recipe must have:\n- title: recipe name\n- description: short desc\n- ingredients: array of strings (simple ingredients)\n- instructions: preparation steps as string or array\n- time: prep time\n- servings: number\n- difficulty: easy/medium/hard";

        return $rule . $jsonInstructions;
    }

    private function buildUserPrompt($lang, $condition, $customRequest)
    {
        $custom = $customRequest ? " - طلب خاص: {$customRequest}" : "";

        if ($lang === 'ar') {
            return "أنشئ 5 وصفات طبية مختلفة تماماً وفريدة للحالة: {$condition}{$custom}

متطلبات مهمة:
1. كل وصفة يجب أن تكون مختلفة 100% عن الأخرى
2. اتبع القواعد الطبية بدقة
3. المكونات يجب أن تكون array بسيط من strings
4. أعط تعليمات واضحة ومفصلة

أرجع JSON object فقط بهذا الشكل:
{
  \"recipes\": [
    {
      \"title\": \"اسم الوصفة\",
      \"description\": \"وصف قصير عن الوصفة\",
      \"ingredients\": [\"مكون 1\", \"مكون 2\", \"مكون 3\"],
      \"instructions\": \"خطوات التحضير بالتفصيل\",
      \"time\": \"25 دقيقة\",
      \"servings\": 2,
      \"difficulty\": \"متوسط\"
    }
  ]
}";
        }

        return "Generate 5 completely different and unique medical recipes for: {$condition}{$custom}

Important requirements:
1. Each recipe must be 100% different from others
2. Follow medical rules precisely
3. Ingredients must be simple array of strings
4. Give clear detailed instructions

Return ONLY JSON object in this format:
{
  \"recipes\": [
    {
      \"title\": \"Recipe Name\",
      \"description\": \"Short description\",
      \"ingredients\": [\"ingredient 1\", \"ingredient 2\", \"ingredient 3\"],
      \"instructions\": \"Detailed preparation steps\",
      \"time\": \"25 min\",
      \"servings\": 2,
      \"difficulty\": \"easy\"
    }
  ]
}";
    }

    private function extractRecipesJson($content)
    {
        $trim = trim($content);

        // محاولة 1: Direct decode
        $decoded = json_decode($trim, true);
        if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
            if (isset($decoded['recipes']) && is_array($decoded['recipes'])) {
                return $decoded;
            }
            // إذا كان array مباشر من الوصفات
            if (isset($decoded[0]['title']) || isset($decoded[0]['name'])) {
                return ['recipes' => $decoded];
            }
        }

        // محاولة 2: استخراج من markdown
        if (preg_match('/```(?:json)?\s*(\{.*?\})\s*```/s', $content, $m)) {
            $decoded = json_decode($m[1], true);
            if (json_last_error() === JSON_ERROR_NONE) {
                if (isset($decoded['recipes'])) {
                    return $decoded;
                }
                return ['recipes' => $decoded];
            }
        }

        // محاولة 3: أي JSON object
        if (preg_match('/\{[\s\S]*"recipes"[\s\S]*\]/s', $content, $m)) {
            $decoded = json_decode($m[0], true);
            if (json_last_error() === JSON_ERROR_NONE) {
                return $decoded;
            }
        }

        Log::error('Failed to parse JSON. Content: ' . substr($content, 0, 500));
        return null;
    }

    private function getRecipeImage($title, $ingredients)
    {
        // بناء كلمات مفتاحية ذكية
        $keywords = $this->buildSmartKeywords($title, $ingredients);

        Log::info("Searching images with keywords: {$keywords}");

        // محاولة Pexels أولاً
        $pexels = $this->fetchFromPexels($keywords);
        if ($pexels) {
            Log::info("Found image from Pexels");
            return $pexels;
        }

        // محاولة Unsplash
        $unsplash = $this->fetchFromUnsplash($keywords);
        if ($unsplash) {
            Log::info("Found image from Unsplash");
            return $unsplash;
        }

        // Fallback
        Log::info("Using fallback image");
        return "https://source.unsplash.com/800x600/?healthy-food," . urlencode(substr($title, 0, 30));
    }

    private function buildSmartKeywords($title, $ingredients)
    {
        $keywords = [];

        // تنظيف العنوان
        $cleanTitle = trim(strtolower($title));
        $cleanTitle = preg_replace('/[^\p{L}\p{N}\s]/u', ' ', $cleanTitle);
        $cleanTitle = str_replace(['وصفة', 'recipe', 'طبية', 'medical', 'صحية', 'healthy'], '', $cleanTitle);

        // ترجمة الأطباق العربية
        $dishTranslations = [
            'منسف' => 'mansaf jordanian lamb rice',
            'مقلوبة' => 'maqluba palestinian rice chicken',
            'كبسة' => 'kabsa saudi rice chicken spices',
            'ملوخية' => 'mulukhiyah green soup',
            'فتة' => 'fatteh chickpeas yogurt',
            'شوربة' => 'soup hot bowl',
            'سلطة' => 'fresh salad vegetables bowl',
            'مشوي' => 'grilled',
            'محشي' => 'stuffed vegetables rice',
            'يخنة' => 'stew vegetables',
            'كفتة' => 'kofta meatballs',
            'شاورما' => 'shawarma grilled meat'
        ];

        // البحث عن مطابقات في العنوان
        foreach ($dishTranslations as $ar => $en) {
            if (str_contains($cleanTitle, $ar)) {
                $keywords[] = $en;
                break; // نوقف عند أول مطابقة
            }
        }

        // إضافة أهم المكونات
        $ingredientTranslations = [
            'دجاج' => 'chicken',
            'سمك' => 'fish',
            'لحم' => 'beef meat',
            'أرز' => 'rice',
            'خضار' => 'vegetables',
            'سبانخ' => 'spinach',
            'بطاطس' => 'potato',
            'طماطم' => 'tomato',
            'خيار' => 'cucumber',
            'جزر' => 'carrot'
        ];

        if (is_array($ingredients) && count($ingredients) > 0) {
            foreach (array_slice($ingredients, 0, 3) as $ing) {
                $ingLower = strtolower(trim($ing));

                // محاولة ترجمة
                foreach ($ingredientTranslations as $ar => $en) {
                    if (str_contains($ingLower, $ar)) {
                        $keywords[] = $en;
                        break;
                    }
                }

                // إضافة المكون نفسه إذا كان بالإنجليزية
                if (preg_match('/^[a-z\s]+$/i', $ingLower)) {
                    $keywords[] = $ingLower;
                }
            }
        }

        // إضافة كلمات عامة لتحسين النتائج
        $keywords[] = "healthy food meal";
        $keywords[] = "gourmet dish";
        $keywords[] = "fresh ingredients";

        // تنظيف وتوحيد الكلمات
        $final = implode(' ', array_unique(array_filter($keywords)));
        $final = preg_replace('/\s+/', ' ', $final);

        return trim(substr($final, 0, 150));
    }

    private function fetchFromPexels($keywords)
    {
        $key = env('PEXELS_API_KEY');
        if (!$key) return null;

        try {
            $response = Http::withHeaders([
                'Authorization' => $key
            ])->timeout(8)->get("https://api.pexels.com/v1/search", [
                'query' => $keywords,
                'per_page' => 15,
                'orientation' => 'landscape',
                'size' => 'large'
            ]);

            if ($response->successful()) {
                $photos = $response->json('photos') ?? [];
                if (!empty($photos)) {
                    // اختيار صورة عشوائية من أفضل 5
                    $topPhotos = array_slice($photos, 0, 5);
                    $pick = $topPhotos[array_rand($topPhotos)];
                    return $pick['src']['large'] ?? $pick['src']['medium'] ?? null;
                }
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
            $response = Http::timeout(8)->get("https://api.unsplash.com/search/photos", [
                'query' => $keywords,
                'orientation' => 'landscape',
                'content_filter' => 'high',
                'per_page' => 15,
                'order_by' => 'relevant',
                'client_id' => $key
            ]);

            if ($response->successful()) {
                $results = $response->json('results') ?? [];
                if (!empty($results)) {
                    // اختيار صورة عشوائية من أفضل 5
                    $topResults = array_slice($results, 0, 5);
                    $pick = $topResults[array_rand($topResults)];
                    return $pick['urls']['regular'] ?? $pick['urls']['small'] ?? null;
                }
            }
        } catch (\Exception $e) {
            Log::warning("Unsplash error: " . $e->getMessage());
        }

        return null;
    }
}
