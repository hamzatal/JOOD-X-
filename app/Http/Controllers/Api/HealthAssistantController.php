<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class HealthAssistantController extends Controller
{
    private $diseaseConstraints = [
        'diabetes' => [
            'ar' => 'السكري',
            'avoid' => ['سكر أبيض', 'مشروبات غازية', 'حلويات'],
            'focus' => ['ألياف', 'بروتين خفيف', 'حبوب كاملة']
        ],
        'kidney' => [
            'ar' => 'الكلى',
            'avoid' => ['ملح زائد', 'مأكولات عالية بوتاسيوم', 'فوسفور عالي'],
            'focus' => ['بروتين معتدل', 'تحكم بالبوتاسيوم/صوديوم']
        ],
        'hypertension' => [
            'ar' => 'ضغط الدم',
            'avoid' => ['ملح', 'أطعمة مقلية', 'وجبات جاهزة'],
            'focus' => ['خضروات', 'بوتاسيوم', 'حبوب كاملة']
        ],
        // add others as needed
    ];

    public function handle(Request $request)
    {
        $data = $request->validate([
            'prompt' => 'required|string|min:2|max:2000',
            'lang' => 'sometimes|string|in:en,ar'
        ]);

        $prompt = trim($data['prompt']);
        $lang = $data['lang'] ?? 'ar';

        $openaiKey = env('OPENAI_API_KEY');
        if (!$openaiKey) {
            return $this->errorResp('OpenAI API key missing', 500, $lang);
        }

        // Detect condition from the text (user types "أنا معي ضغط..." etc.)
        $condition = $this->detectConditionFromText($prompt);

        // If user explicitly asked for a recipe (keywords like "وصفة", "recipe", "how to cook")
        $wantsRecipe = preg_match('/\b(وصفة|وصفه|recipe|cook|كيف أطبخ|how to)/iu', $prompt);

        // Build system message strongly instructing the AI about medical context
        $system = $this->buildSystemMessage($lang, $condition);

        $userMsg = $this->buildUserMessage($prompt, $lang, $condition, $wantsRecipe);

        $cacheKey = 'health_' . md5($system . $userMsg);
        $cached = Cache::get($cacheKey);
        if ($cached) {
            return response()->json(array_merge($cached, ['cached' => true]));
        }

        try {
            $resp = Http::withToken($openaiKey)
                ->timeout(30)
                ->post('https://api.openai.com/v1/chat/completions', [
                    'model' => 'gpt-4o-mini',
                    'messages' => [
                        ['role' => 'system', 'content' => $system],
                        ['role' => 'user', 'content' => $userMsg],
                    ],
                    'temperature' => 0.2,
                    'max_tokens' => 1000,
                ]);

            if (!$resp->successful()) {
                Log::error('HealthAssistant OpenAI error: ' . $resp->body());
                return $this->errorResp('AI error', 500, $lang);
            }

            $content = $resp->json('choices.0.message.content') ?? '';

            // If wantsRecipe -> try extract JSON recipe block
            if ($wantsRecipe) {
                $json = $this->extractJSON($content);
                if ($json && isset($json['recipe'])) {
                    // attach image via Unsplash
                    $image = $this->getRecipeImage($json['recipe']['title'] ?? 'healthy food');
                    $json['recipe']['image_url'] = $image;
                    $out = ['type' => 'recipe', 'recipe' => $json['recipe']];
                    Cache::put($cacheKey, $out, now()->addHour());
                    return response()->json($out);
                } else {
                    // AI didn't return JSON — return it as text with suggestion to re-request JSON
                    $out = ['type' => 'text', 'answer' => $content, 'suggestions' => $this->getFoodSuggestions($condition, $lang)];
                    Cache::put($cacheKey, $out, now()->addHour());
                    return response()->json($out);
                }
            }

            // Otherwise return textual answer + suggestions
            $out = ['type' => 'text', 'answer' => $content, 'suggestions' => $this->getFoodSuggestions($condition, $lang)];
            Cache::put($cacheKey, $out, now()->addHour());
            return response()->json($out);
        } catch (\Exception $e) {
            Log::error('HealthAssistant exception: ' . $e->getMessage());
            return $this->errorResp('Server error', 500, $lang);
        }
    }

    private function detectConditionFromText($text)
    {
        $t = mb_strtolower($text);
        $map = [
            'diabetes' => ['سكري', 'سكر', 'diabetes', 'diabetic'],
            'kidney' => ['كلى', 'كلية', 'kidney', 'renal'],
            'hypertension' => ['ضغط', 'ضغط الدم', 'hypertension', 'blood pressure'],
            'heart' => ['قلب', 'cardiac', 'heart'],
        ];
        foreach ($map as $cond => $terms) {
            foreach ($terms as $term) {
                if (mb_stripos($t, $term) !== false) return $cond;
            }
        }
        return 'general';
    }

    private function buildSystemMessage($lang, $condition)
    {
        $cons = $this->diseaseConstraints[$condition] ?? null;
        if ($lang === 'ar') {
            $base = "أنت مساعد تغذية سريري. عندما يُطلب وصفة، أعد استجابة JSON فقط بصيغة recipe. عندما يسأل المستخدم سؤالاً عاماً، أجب بنص قصير ثم اقترح أطعمة مناسبة وممنوعة.\n";
            if ($cons) {
                $base .= "المرض المحدد: " . $cons['ar'] . ". تجنب: " . implode(', ', $cons['avoid']) . ". ركز على: " . implode(', ', $cons['focus']) . ".\n";
            }
            $base .= "صيغة JSON للوصْفة (أجب فقط بالـJSON عند طلب وصفة):\n";
            $base .= "```json\n{ \"recipe\": { \"title\":\"\",\"description\":\"\",\"ingredients\":[{\"item\":\"\",\"amount\":\"\",\"notes\":\"\"}], \"instructions\":[\"step1\",\"step2\"], \"prep_time\":\"\",\"cook_time\":\"\",\"servings\":2, \"nutrition\":{}} }\n```";
            return $base;
        } else {
            $base = "You are a clinical nutrition assistant. If the user requests a recipe return ONLY JSON using the 'recipe' object. For general questions answer short text and provide food suggestions.\n";
            if ($cons) {
                $base .= "Medical condition: " . ucfirst($condition) . ". Avoid: " . implode(', ', $cons['avoid']) . ". Focus: " . implode(', ', $cons['focus']) . ".\n";
            }
            $base .= "JSON format for recipe (reply ONLY JSON when recipe requested).";
            return $base;
        }
    }

    private function buildUserMessage($prompt, $lang, $condition, $wantsRecipe)
    {
        $msg = ($lang === 'ar' ? "طلب المستخدم: " : "User request: ") . $prompt . "\n";
        $msg .= ($lang === 'ar' ? "الكشف الآلي للحالة: " : "Detected condition: ") . $condition . "\n";
        $msg .= ($wantsRecipe ? ($lang === 'ar' ? "أرجو صيغة JSON للوصفة كاملة." : "Return recipe JSON only.") : "");
        return $msg;
    }

    private function extractJSON($content)
    {
        $trim = trim($content);
        // try direct
        if (strpos($trim, '{') === 0) {
            $dec = json_decode($trim, true);
            if (json_last_error() === JSON_ERROR_NONE) return $dec;
        }
        // look for codeblock
        if (preg_match('/```(?:json)?\s*(\{.*?\})\s*```/s', $content, $m)) {
            $dec = json_decode($m[1], true);
            if (json_last_error() === JSON_ERROR_NONE) return $dec;
        }
        // try extract first object
        if (preg_match('/\{(?:[^{}]|(?R))*\}/s', $content, $m)) {
            $dec = json_decode($m[0], true);
            if (json_last_error() === JSON_ERROR_NONE) return $dec;
        }
        return null;
    }

    private function getRecipeImage($title)
    {
        // prefer Unsplash if key present
        $unsplash = env('UNSPLASH_ACCESS_KEY');
        if ($unsplash) {
            try {
                $q = urlencode($title . ' healthy food');
                $res = Http::timeout(6)->get('https://api.unsplash.com/search/photos', ['query' => $q, 'per_page' => 1, 'client_id' => $unsplash]);
                if ($res->successful()) {
                    $r = $res->json();
                    if (!empty($r['results'][0]['urls']['regular'])) {
                        return $r['results'][0]['urls']['regular'];
                    }
                }
            } catch (\Exception $e) {
                Log::warning('Unsplash error: ' . $e->getMessage());
            }
        }
        return 'https://picsum.photos/800/600?seed=' . urlencode($title . rand(1, 9999));
    }

    private function getFoodSuggestions($condition, $lang)
    {
        $cons = $this->diseaseConstraints[$condition] ?? null;
        if (!$cons) return [];
        return [
            'recommended' => $cons['focus'],
            'avoid' => $cons['avoid'],
            'tips' => $lang === 'ar'
                ? ['راجع طبيبك المختص قبل تعديل النظام الغذائي.', 'قسم الوجبات لكمية أصغر.']
                : ['Consult your healthcare provider.', 'Use smaller frequent meals.']
        ];
    }

    private function errorResp($msg, $code, $lang)
    {
        $local = $lang === 'ar' ? 'عذراً، حدث خطأ.' : 'Sorry, an error occurred.';
        return response()->json(['error' => true, 'message' => $local, 'details' => env('APP_DEBUG') ? $msg : null], $code);
    }
}
