<?php

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
        try {
            $lang     = $request->query('lang', 'en') === 'ar' ? 'ar' : 'en';
            $category = $request->query('category', 'all');
            $refresh  = $request->query('refresh', 'false') === 'true';

            $cacheKey = "kids_meals_v4_{$lang}_{$category}";

            if ($refresh) {
                Cache::forget($cacheKey);
                Log::info("Cache cleared for kids meals: {$cacheKey}");
            }

            if (Cache::has($cacheKey)) {
                return response()->json([
                    'success' => true,
                    'recipes' => Cache::get($cacheKey)
                ]);
            }

            $apiKey = env('OPENAI_API_KEY');
            if (!$apiKey) {
                return response()->json(['success' => false, 'recipes' => []], 500);
            }

            $prompt = $this->buildPrompt($lang, $category);

            $response = Http::timeout(90)
                ->retry(3, 2000)
                ->withToken($apiKey)
                ->post('https://api.openai.com/v1/chat/completions', [
                    'model'       => 'gpt-4o-mini',
                    'messages'    => [
                        ['role' => 'system', 'content' => 'You are a creative children\'s nutrition expert. Return ONLY a clean valid JSON array. No text, no markdown.'],
                        ['role' => 'user',   'content' => $prompt]
                    ],
                    'temperature' => 0.82,
                    'max_tokens'  => 3200,
                ]);

            if ($response->failed()) {
                Log::error('OpenAI Error', ['status' => $response->status()]);
                return response()->json(['success' => false, 'recipes' => []]);
            }

            $raw = $response->json('choices.0.message.content', '');
            $recipes = $this->extractJsonArray($raw);

            if (!$recipes || count($recipes) < 6) {
                return response()->json(['success' => false, 'recipes' => []]);
            }

            foreach ($recipes as &$r) {
                $query = $r['image_query'] ?? $r['title'] ?? 'healthy kids meal';
                $r['image'] = $this->fetchBestImage($this->cleanImageQuery($query));

                $r['titleAr']          ??= $r['title'] ?? 'وجبة لذيذة للأطفال';
                $r['description']      ??= 'وجبة صحية وممتعة للأطفال';
                $r['prepTime']         ??= '10';
                $r['cookTime']         ??= '20';
                $r['calories']         ??= '280';
                $r['protein']          ??= '14g';
                $r['tags']             ??= ['للأطفال', 'صحي', 'لذيذ'];
                $r['kid_friendly_tip'] ??= 'دع طفلك يشارك في التحضير!';
            }

            Cache::put($cacheKey, $recipes, now()->addHours(2));

            return response()->json([
                'success' => true,
                'recipes' => $recipes
            ]);

        } catch (\Exception $e) {
            Log::error('KidsMealsController Fatal Error: ' . $e->getMessage());
            return response()->json(['success' => false, 'recipes' => []]);
        }
    }

    private function buildPrompt($lang, $category)
    {
        $cat = match($category) {
            'breakfast' => $lang === 'ar' ? 'فطور' : 'breakfast',
            'lunch'     => $lang === 'ar' ? 'غداء' : 'lunch',
            'dinner'    => $lang === 'ar' ? 'عشاء' : 'dinner',
            'snack'     => $lang === 'ar' ? 'سناك' : 'snack',
            default     => $lang === 'ar' ? 'متنوعة' : 'varied'
        };

        return $lang === 'ar'
            ? "أعطني 8 وصفات {$cat} صحية ولذيذة جدًا للأطفال (3-10 سنوات)، عربية أصيلة ومحبوبة.
- ممنوع أي توابل حارة
- مكونات بسيطة
- شكل الطبق مرح (نجوم، قلوب، وجوه مبتسمة)
- تعليمات مرقمة بوضوح
أرجع JSON فقط بهذا الشكل:
[{\"title\":\"English Name\",\"titleAr\":\"الاسم بالعربي\",\"description\":\"وصف ممتع\",\"ingredients\":[\"مكون1\",\"مكون2\"],\"instructions\":\"1. خطوة\\n2. خطوة\",\"prepTime\":\"15\",\"cookTime\":\"25\",\"calories\":\"300\",\"protein\":\"15g\",\"tags\":[\"صحي\",\"أطفال\"],\"kid_friendly_tip\":\"نصيحة مرحة\",\"image_query\":\"clear english name for image search like 'cheesy manakish'\"}]"
            : "Give me 8 super tasty and healthy {$cat} recipes for kids 3-10 years, authentic Arabic style.
- NO spicy food
- Simple ingredients
- Fun presentation (stars, hearts, smiley faces)
- Clear numbered steps
Return ONLY JSON array only:
[{\"title\":\"English Name\",\"titleAr\":\"الاسم بالعربي\",\"description\":\"Fun description\",\"ingredients\":[\"ing1\",\"ing2\"],\"instructions\":\"1. Step one\\n2. Step two\",\"prepTime\":\"15\",\"cookTime\":\"25\",\"calories\":\"300\",\"protein\":\"15g\",\"tags\":[\"healthy\",\"kids\"],\"kid_friendly_tip\":\"Fun tip\",\"image_query\":\"clear english name like 'cheesy manakish'\"}]";
    }

    private function extractJsonArray($text)
    {
        $text = trim($text);
        $text = preg_replace('/^```json\s*|```$/m', '', $text);

        if (preg_match('/\[[\s\S]*\]/', $text, $m)) {
            $decoded = json_decode($m[0], true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) return $decoded;
        }

        $decoded = json_decode($text, true);
        return (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) ? $decoded : [];
    }

    private function cleanImageQuery($query)
    {
        $query = preg_replace('/[\x{0600}-\x{06FF}]/u', '', $query);
        $query = preg_replace('/[^a-zA-Z0-9\s]/', '', strtolower(trim($query)));
        return $query . " kids food photography";
    }

    private function fetchBestImage($query)
    {
        $img = $this->spoonacular($query);
        if ($img) return $img;

        $img = $this->pexels($query);
        if ($img) return $img;

        $img = $this->unsplash($query);
        if ($img) return $img;

        return "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=600&fit=crop";
    }

    private function spoonacular($query)
    {
        $key = env('SPOONACULAR_API_KEY');
        if (!$key) return null;

        return Cache::remember("spoon_kids_".md5($query), 7200, function() use($key, $query){
            $res = Http::timeout(8)->get('https://api.spoonacular.com/recipes/complexSearch', [
                'apiKey' => $key,
                'query' => $query,
                'number' => 3,
                'addRecipeInformation' => true
            ]);
            return $res->successful() ? ($res->json('results.0.image') ?? null) : null;
        });
    }

    private function pexels($query)
    {
        $key = env('PEXELS_API_KEY');
        if (!$key) return null;

        return Cache::remember("pexels_kids_".md5($query), 3600, function() use($key, $query){
            $res = Http::timeout(6)
                ->withHeaders(['Authorization' => $key])
                ->get('https://api.pexels.com/v1/search', [
                    'query' => $query,
                    'per_page' => 1
                ]);
            return $res->successful() ? ($res->json('photos.0.src.large') ?? null) : null;
        });
    }

    private function unsplash($query)
    {
        $key = env('UNSPLASH_ACCESS_KEY');
        if (!$key) return null;

        return Cache::remember("unsplash_kids_".md5($query), 3600, function() use($key, $query){
            $res = Http::timeout(6)->get('https://api.unsplash.com/search/photos', [
                'query' => $query,
                'client_id' => $key,
                'per_page' => 1
            ]);
            return $res->successful() ? ($res->json('results.0.urls.regular') ?? null) : null;
        });
    }

    // نصائح التغذية (اتركها كما هي، شغالة تمام)
    public function getTips(Request $request)
    {
        $lang = $request->query('lang', 'en') === 'ar' ? 'ar' : 'en';
        $cacheKey = "kids_nutrition_tips_{$lang}";

        if (Cache::has($cacheKey)) {
            return response()->json(['success' => true, 'tips' => Cache::get($cacheKey)]);
        }

        $tips = $lang === 'ar' ? [
            'قدم الخضروات والفواكه الملونة يومياً',
            'شجع طفلك على شرب الماء',
            'قلل الحلويات المصنعة',
            'اجعل وقت الأكل ممتعاً',
            'كن قدوة حسنة',
            'دع طفلك يساعد في الطبخ',
            'قدم وجبات صغيرة ومتكررة',
            'تحلى بالصبر مع الأكلات الجديدة'
        ] : [
            'Offer colorful fruits and veggies daily',
            'Encourage water drinking',
            'Limit processed sweets',
            'Make mealtime fun',
            'Be a good role model',
            'Let kids help in kitchen',
            'Small frequent meals',
            'Be patient with new foods'
        ];

        Cache::put($cacheKey, $tips, 86400);
        return response()->json(['success' => true, 'tips' => $tips]);
    }
}