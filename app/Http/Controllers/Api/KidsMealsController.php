<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class KidsMealsController extends Controller
{
    /** الكلمات المطلوبة للتأكد أن الصورة مرتبطة بالطبق فعلاً */
    private $allowedFoodKeywords = [
        'pizza','pasta','noodles','rice','potato','sweet potato','fries','salad',
        'soup','stew','chicken','beef','meat','fish','shrimp','egg','omelette',
        'manakish','flatbread','cake','muffin','pancake','waffle','baked','roasted'
    ];

    /** كلمات ممنوعة لأنها تسبب صور غير مناسبة */
    private $bannedKeywords = [
        'hummus','dip','platter','people','kid','child','face','person','toy',
        'baby','girls','boys','hand','finger','toast','wrap','burger','sandwich'
    ];

    public function index(Request $request)
    {
        try {
            $lang     = $request->query('lang', 'en') === 'ar' ? 'ar' : 'en';
            $category = $request->query('category', 'all');
            $refresh  = $request->query('refresh', 'false') === 'true';

            $cacheKey = "kids_meals_v6_{$lang}_{$category}";

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
                        [
                            'role' => 'system',
                            'content' => 'Return ONLY valid JSON array. No text, no markdown, no explanation.'
                        ],
                        ['role' => 'user', 'content' => $prompt]
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
                $title   = $r['title'] ?? 'kids meal';
                $ingList = $r['ingredients'] ?? [];
                $cleanQuery = $this->cleanImageQuery($title, $ingList);

                $r['image'] = $this->fetchBestImage($cleanQuery);

                // Fill missing fields
                $r['titleAr']          ??= $r['title'] ?? 'وجبة للأطفال';
                $r['description']      ??= 'وجبة صحية ولذيذة للأطفال';
                $r['prepTime']         ??= '10';
                $r['cookTime']         ??= '20';
                $r['calories']         ??= '280';
                $r['protein']          ??= '14g';
                $r['tags']             ??= ['للأطفال', 'صحي', 'لذيذ'];
                $r['kid_friendly_tip'] ??= 'اجعل طفلك يشارك في التحضير!';
            }

            Cache::put($cacheKey, $recipes, now()->addHours(2));

            return response()->json(['success' => true, 'recipes' => $recipes]);

        } catch (\Exception $e) {
            Log::error('KidsMealsController Fatal Error: ' . $e->getMessage());
            return response()->json(['success' => false, 'recipes' => []]);
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
            ? "أعطني 8 وصفات {$cat} صحية ولذيذة للأطفال (3-10). رجّع JSON فقط:
[{\"title\":\"English Name\",\"titleAr\":\"اسم عربي\",\"description\":\"وصف\",\"ingredients\":[\"مكون\"],\"instructions\":\"1\\n2\",\"prepTime\":\"10\",\"cookTime\":\"20\",\"calories\":\"200\",\"protein\":\"10g\",\"kid_friendly_tip\":\"نصيحة\",\"image_query\":\"food name\"}]"
            : "Give me 8 {$cat} recipes for kids 3-10. Return ONLY JSON array:
[{\"title\":\"Name\",\"titleAr\":\"اسم عربي\",\"description\":\"desc\",\"ingredients\":[\"ing\"],\"instructions\":\"1\\n2\",\"prepTime\":\"10\",\"cookTime\":\"20\",\"calories\":\"200\",\"protein\":\"10g\",\"kid_friendly_tip\":\"tip\",\"image_query\":\"food name\"}]";
    }

    private function extractJsonArray($text)
    {
        $text = trim($text);
        $text = preg_replace('/^```json\s*|```$/m', '', $text);

        if (preg_match('/\[[\s\S]*\]/', $text, $m)) {
            $decoded = json_decode($m[0], true);
            if (json_last_error() === JSON_ERROR_NONE) return $decoded;
        }

        return [];
    }

    private function cleanImageQuery($title, $ingredients)
    {
        // Remove Arabic
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

        return Cache::remember("spoon_v6_".md5($query), 7200, function() use($key,$query){
            $res = Http::timeout(8)->get('https://api.spoonacular.com/recipes/complexSearch',[
                'apiKey'=>$key,'query'=>$query,'number'=>3,'addRecipeInformation'=>true
            ]);
            return $res->successful() ? ($res->json('results.0.image') ?? null) : null;
        });
    }

    private function pexels($query)
    {
        $key = env('PEXELS_API_KEY');
        if (!$key) return null;

        return Cache::remember("pexels_v6_".md5($query), 3600, function() use($key,$query){
            $res = Http::timeout(6)
                ->withHeaders(['Authorization'=>$key])
                ->get('https://api.pexels.com/v1/search',[
                    'query'=>$query,'per_page'=>3
                ]);

            return $res->successful() ? ($res->json('photos.0.src.large') ?? null) : null;
        });
    }

    private function unsplash($query)
    {
        $key = env('UNSPLASH_ACCESS_KEY');
        if (!$key) return null;

        return Cache::remember("unsplash_v6_".md5($query), 3600, function () use ($key, $query) {

            $res = Http::timeout(8)->get('https://api.unsplash.com/search/photos', [
                'query'         => $query,
                'client_id'     => $key,
                'per_page'      => 12,
                'orientation'   => 'landscape',
                'content_filter'=> 'high'
            ]);

            if (!$res->successful()) return null;

            $results = $res->json('results', []);
            $filtered = [];

            foreach ($results as $img) {
                $tags = strtolower(json_encode($img));

                // 1) reject bad images
                foreach ($this->bannedKeywords as $bad) {
                    if (str_contains($tags, $bad)) continue 2;
                }

                // 2) ensure food match
                $matchesFood = false;
                foreach ($this->allowedFoodKeywords as $good) {
                    if (str_contains($tags, $good)) {
                        $matchesFood = true;
                        break;
                    }
                }
                if (!$matchesFood) continue;

                $filtered[] = $img;
            }

            if (empty($filtered)) {
                $fallback = $results[0] ?? null;
                return $fallback['urls']['regular'] ?? null;
            }

            usort($filtered, fn($a,$b)=>($b['likes']??0)<=>($a['likes']??0));

            return $filtered[0]['urls']['regular'] ?? null;
        });
    }

    public function getTips(Request $request)
    {
        $lang = $request->query('lang','en')==='ar'?'ar':'en';
        $cacheKey="kids_tips_{$lang}";

        if(Cache::has($cacheKey))
            return response()->json(['success'=>true,'tips'=>Cache::get($cacheKey)]);

        $tips = $lang==='ar'
            ? ['قدم الخضار والفواكه','شجع الطفل على شرب الماء','قلل السكر','قدم وجبات صغيرة','كن قدوة حسنة']
            : ['Offer fruits & veggies','Encourage water','Limit sugar','Small meals','Be a role model'];

        Cache::put($cacheKey,$tips,86400);

        return response()->json(['success'=>true,'tips'=>$tips]);
    }
}
