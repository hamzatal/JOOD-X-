<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class KidsMealsController extends Controller
{
    private $allowedFoodKeywords = [
        'pizza',
        'pasta',
        'noodles',
        'rice',
        'potato',
        'sweet potato',
        'fries',
        'salad',
        'soup',
        'stew',
        'chicken',
        'beef',
        'meat',
        'fish',
        'shrimp',
        'egg',
        'omelette',
        'manakish',
        'flatbread',
        'cake',
        'muffin',
        'pancake',
        'waffle',
        'baked',
        'roasted'
    ];

    private $bannedKeywords = [
        'hummus',
        'dip',
        'platter',
        'people',
        'kid',
        'child',
        'face',
        'person',
        'toy',
        'baby',
        'girls',
        'boys',
        'hand',
        'finger',
        'toast',
        'wrap',
        'burger',
        'sandwich'
    ];

    public function index(Request $request)
    {
        try {
            $lang     = $request->query('lang', 'en') === 'ar' ? 'ar' : 'en';
            $category = $request->query('category', 'all');
            $refresh  = $request->query('refresh', 'false') === 'true';

            $cacheKey = "kids_meals_v7_{$lang}_{$category}";

            if ($refresh) {
                Cache::forget($cacheKey);
            }

            if (Cache::has($cacheKey)) {
                return response()->json([
                    'success' => true,
                    'recipes' => Cache::get($cacheKey)
                ]);
            }

            $apiKey = env('OPENAI_API_KEY');
            if (!$apiKey)
                return response()->json(['success' => false, 'recipes' => []], 500);

            $prompt = $this->buildPrompt($lang, $category);

            $response = Http::timeout(90)
                ->retry(3, 1500)
                ->withToken($apiKey)
                ->post("https://api.openai.com/v1/chat/completions", [
                    "model" => "gpt-4o-mini",
                    "messages" => [
                        ["role" => "system", "content" => "ONLY return valid JSON array, no explanation."],
                        ["role" => "user", "content" => $prompt],
                    ],
                    "max_tokens" => 3500,
                    "temperature" => 0.8
                ]);

            $raw = $response->json("choices.0.message.content", "");
            $recipes = $this->extractJsonArray($raw);

            if (!$recipes || count($recipes) !== 8) {
                return response()->json(['success' => false, 'recipes' => []]);
            }

            foreach ($recipes as &$r) {
                $title   = $r['title'] ?? 'kids meal';
                $ingList = $r['ingredients'] ?? [];
                $cleanQuery = $this->cleanImageQuery($title, $ingList);

                $r['image'] = $this->fetchBestImage($cleanQuery);

                // إعادة تعبئة الحقول الناقصة
                $r['titleAr']          ??= $r['title'];
                $r['description']      ??= 'وصفة مفيدة وصحية للأطفال';
                $r['prepTime']         ??= '10';
                $r['cookTime']         ??= '20';
                $r['calories']         ??= '250';
                $r['protein']          ??= '10g';
                $r['kid_friendly_tip'] ??= 'دع الطفل يشارك في التحضير!';
                $r['tags']             ??= ['للأطفال', 'سهل', 'صحي'];

                // الحقول الجديدة
                $r['servings']   ??= 2;
                $r['difficulty'] ??= 'سهل';
                $r['benefits']   ??= 'هذا الطبق غني بالعناصر المفيدة التي تدعم نمو الأطفال وتعزز الطاقة.';
                $r['time']       ??= intval($r['prepTime']) + intval($r['cookTime']);
            }

            Cache::put($cacheKey, $recipes, now()->addHours(2));

            return response()->json(["success" => true, "recipes" => $recipes]);
        } catch (\Exception $e) {
            Log::error("KidsMealsController error: " . $e->getMessage());
            return response()->json(["success" => false, "recipes" => []]);
        }
    }

    private function buildPrompt($lang, $category)
    {
        $cat = [
            'breakfast' => $lang === 'ar' ? 'فطور' : 'breakfast',
            'lunch'     => $lang === 'ar' ? 'غداء' : 'lunch',
            'dinner'    => $lang === 'ar' ? 'عشاء' : 'dinner',
            'snack'     => $lang === 'ar' ? 'سناك' : 'snack',
            'all'       => $lang === 'ar' ? 'متنوعة' : 'varied'
        ][$category] ?? 'varied';

        return $lang === 'ar'
            ? "أعطني **8 وصفات بالضبط** من فئة {$cat}.
أعد فقط JSON بدون أي نص إضافي.

[
 {
   \"title\": \"English Name\",
   \"titleAr\": \"اسم عربي واضح\",
   \"description\": \"وصف جذاب\",
   \"ingredients\": [\"مكون1\",\"مكون2\",\"مكون3\"],
   \"instructions\": \"1. خطوة مفصلة\\n2. خطوة ثانية\\n(6–12 خطوات)\",
   \"prepTime\": \"10\",
   \"cookTime\": \"20\",
   \"time\": \"30\",
   \"servings\": 2,
   \"difficulty\": \"سهل\",
   \"calories\": \"200\",
   \"protein\": \"10g\",
   \"benefits\": \"فقرة قصيرة من 2-3 أسطر\",
   \"kid_friendly_tip\": \"نصيحة ممتعة\",
   \"image_query\": \"food name\"
 }
]

❗ يجب أن يكون العدد 8 فقط."
            :
            "Give me **exactly 8 recipes** for {$cat} for kids.
Return ONLY JSON.

[
 {
   \"title\": \"English Name\",
   \"titleAr\": \"Arabic Name\",
   \"description\": \"Short fun description\",
   \"ingredients\": [\"ing1\",\"ing2\",\"ing3\"],
   \"instructions\": \"1. step\\n2. step\\n(6–12 steps)\",
   \"prepTime\": \"10\",
   \"cookTime\": \"20\",
   \"time\": \"30\",
   \"servings\": 2,
   \"difficulty\": \"easy\",
   \"calories\": \"200\",
   \"protein\": \"10g\",
   \"benefits\": \"2–3 line paragraph\",
   \"kid_friendly_tip\": \"Tip\",
   \"image_query\": \"food name\"
 }
]

❗ MUST return exactly 8 items.";
    }

    private function extractJsonArray($text)
    {
        $text = trim($text);
        $text = preg_replace('/^```json\s*|```$/m', '', $text);

        if (preg_match('/\[[\s\S]*\]/', $text, $m)) {
            $arr = json_decode($m[0], true);
            return is_array($arr) ? $arr : [];
        }

        return [];
    }

    private function cleanImageQuery($title, $ingredients)
    {
        $title = preg_replace('/[\x{0600}-\x{06FF}]/u', '', $title);

        $ing = [];
        foreach ($ingredients as $i) {
            $i = preg_replace('/[^a-zA-Z ]/', '', strtolower($i));
            if (strlen($i) > 3) $ing[] = $i;
            if (count($ing) >= 2) break;
        }

        $q = strtolower(trim($title . ' ' . implode(' ', $ing)));
        $q = preg_replace('/(kid|child|people|toy|face|baby)/i', '', $q);

        return trim($q . ' food plate top view photography');
    }

    private function fetchBestImage($query)
    {
        if ($img = $this->spoonacular($query)) return $img;
        if ($img = $this->pexels($query)) return $img;
        if ($img = $this->unsplash($query)) return $img;

        return "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=600&fit=crop";
    }

    private function spoonacular($query)
    {
        $key = env('SPOONACULAR_API_KEY');
        if (!$key) return null;

        return Cache::remember("spoon_v7_" . md5($query), 7200, function () use ($key, $query) {
            $res = Http::timeout(8)->get("https://api.spoonacular.com/recipes/complexSearch", [
                "apiKey" => $key,
                "query" => $query,
                "number" => 3,
                "addRecipeInformation" => true
            ]);
            return $res->successful() ? ($res->json("results.0.image") ?? null) : null;
        });
    }

    private function pexels($query)
    {
        $key = env('PEXELS_API_KEY');
        if (!$key) return null;

        return Cache::remember("pexels_v7_" . md5($query), 3600, function () use ($key, $query) {
            $res = Http::timeout(6)
                ->withHeaders(["Authorization" => $key])
                ->get("https://api.pexels.com/v1/search", [
                    "query" => $query,
                    "per_page" => 3
                ]);
            return $res->successful() ? ($res->json("photos.0.src.large") ?? null) : null;
        });
    }

    private function unsplash($query)
    {
        $key = env('UNSPLASH_ACCESS_KEY');
        if (!$key) return null;

        return Cache::remember("unsplash_v7_" . md5($query), 3600, function () use ($key, $query) {

            $res = Http::timeout(8)->get("https://api.unsplash.com/search/photos", [
                "query" => $query,
                "client_id" => $key,
                "per_page" => 12,
                "orientation" => "landscape",
                "content_filter" => "high"
            ]);

            if (!$res->successful()) return null;

            $results = $res->json("results", []);
            $filtered = [];

            foreach ($results as $img) {
                $tags = strtolower(json_encode($img));

                foreach ($this->bannedKeywords as $bad)
                    if (str_contains($tags, $bad)) continue 2;

                $matchesFood = false;
                foreach ($this->allowedFoodKeywords as $good)
                    if (str_contains($tags, $good)) {
                        $matchesFood = true;
                        break;
                    }

                if (!$matchesFood) continue;

                $filtered[] = $img;
            }

            if (empty($filtered)) {
                $fallback = $results[0] ?? null;
                return $fallback['urls']['regular'] ?? null;
            }

            usort($filtered, fn($a, $b) => ($b['likes'] ?? 0) <=> ($a['likes'] ?? 0));
            return $filtered[0]['urls']['regular'] ?? null;
        });
    }

    /** 🔥 نصائح من OpenAI API بدل hardcoded */
    public function getTips(Request $request)
    {
        $lang = $request->query("lang", "en") === "ar" ? "ar" : "en";
        $cacheKey = "kids_tips_api_{$lang}";

        if (Cache::has($cacheKey)) {
            return response()->json([
                "success" => true,
                "tips" => Cache::get($cacheKey)
            ]);
        }

        $apiKey = env('OPENAI_API_KEY');
        if (!$apiKey)
            return response()->json(["success" => false, "tips" => []]);

        // prompt
        $prompt = $lang === 'ar'
            ? "أعطني 8 نصائح تغذية قصيرة ومفيدة للأطفال (3–10 سنوات).
أعد فقط JSON array مثل:
[\"tip1\",\"tip2\", ...] بدون أي نص إضافي."
            : "Give me exactly 8 short useful nutrition tips for kids (age 3–10).
Return ONLY a JSON array:
[\"tip1\", \"tip2\", ...]. No additional text.";

        // call API
        $response = Http::timeout(40)
            ->retry(2, 1500)
            ->withToken($apiKey)
            ->post("https://api.openai.com/v1/chat/completions", [
                "model" => "gpt-4o-mini",
                "messages" => [
                    ["role" => "system", "content" => "Return ONLY JSON array."],
                    ["role" => "user", "content" => $prompt]
                ],
                "max_tokens" => 300
            ]);

        $raw = $response->json("choices.0.message.content", "");
        $tips = $this->extractJsonArray($raw);

        if (!is_array($tips) || count($tips) !== 8)
            return response()->json(["success" => false, "tips" => []]);

        Cache::put($cacheKey, $tips, 86400);

        return response()->json(["success" => true, "tips" => $tips]);
    }
}
