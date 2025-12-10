<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class KidsMealsController extends Controller
{
    public function index(Request $request)
    {
        $lang = $request->query('lang', 'en') === 'ar' ? 'ar' : 'en';
        $refresh = $request->query('refresh') === 'true';

        $cacheKey = "kids_meals_v2_{$lang}";

        if (!$refresh && Cache::has($cacheKey)) {
            return response()->json(['recipes' => Cache::get($cacheKey)]);
        }

        $openaiKey = env('OPENAI_API_KEY');

        if (!$openaiKey) {
            Log::error('OpenAI API key missing');
            return response()->json(['error' => 'API key missing'], 500);
        }

        try {
            $systemPrompt = $this->buildSystemPrompt($lang);
            $userPrompt = $this->buildUserPrompt($lang);

            Log::info('Generating kids meals via OpenAI...');

            $resp = Http::withToken($openaiKey)
                ->timeout(40)
                ->post('https://api.openai.com/v1/chat/completions', [
                    'model' => 'gpt-4o-mini',
                    'messages' => [
                        ['role' => 'system', 'content' => $systemPrompt],
                        ['role' => 'user', 'content' => $userPrompt],
                    ],
                    'temperature' => 0.8,
                    'max_tokens' => 3500,
                    'response_format' => ['type' => 'json_object']
                ]);

            if (!$resp->successful()) {
                Log::error('OpenAI error: ' . $resp->body());
                return response()->json(['error' => 'OpenAI API error'], 500);
            }

            $content = $resp->json('choices.0.message.content') ?? '';
            $recipesData = $this->extractRecipesJson($content);

            if (!$recipesData || !isset($recipesData['recipes'])) {
                Log::error('Failed to extract recipes');
                return response()->json(['error' => 'Failed to parse recipes'], 500);
            }

            $recipes = [];
            foreach (array_slice($recipesData['recipes'], 0, 12) as $r) {
                $title = $r['title'] ?? $r['name'] ?? 'Kids Meal';

                $ingredients = [];
                if (isset($r['ingredients']) && is_array($r['ingredients'])) {
                    foreach ($r['ingredients'] as $ing) {
                        if (is_string($ing)) {
                            $ingredients[] = $ing;
                        } elseif (is_array($ing)) {
                            $ingredients[] = $ing['item'] ?? $ing['name'] ?? '';
                        }
                    }
                }

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
                }

                $image = $this->getRecipeImage($title, $ingredients);

                $recipes[] = [
                    'id' => (string) Str::uuid(),
                    'title' => $title,
                    'titleAr' => $r['titleAr'] ?? null,
                    'description' => $r['description'] ?? $r['desc'] ?? '',
                    'category' => $r['category'] ?? ($lang === 'ar' ? 'وجبة أطفال' : 'Kids Meal'),
                    'categoryAr' => $r['categoryAr'] ?? 'وجبة أطفال',
                    'time' => $r['time'] ?? $r['prep_time'] ?? '20',
                    'servings' => $r['servings'] ?? 2,
                    'difficulty' => $r['difficulty'] ?? ($lang === 'ar' ? 'سهل' : 'Easy'),
                    'age_range' => $r['age_range'] ?? '3-10',
                    'ingredients' => $ingredients,
                    'instructions' => $instructions,
                    'instructionsAr' => $r['instructionsAr'] ?? null,
                    'calories' => $r['calories'] ?? rand(150, 300),
                    'protein' => $r['protein'] ?? rand(8, 20) . 'g',
                    'benefits' => $r['benefits'] ?? '',
                    'kid_friendly_tip' => $r['kid_friendly_tip'] ?? '',
                    'image' => $image,
                    'rating' => $r['rating'] ?? (4.5 + (rand(0, 5) / 10)),
                ];
            }

            Cache::put($cacheKey, $recipes, 21600); // 6 hours

            Log::info('Successfully generated ' . count($recipes) . ' kids meals');

            return response()->json(['recipes' => $recipes]);
        } catch (\Exception $e) {
            Log::error('Kids meals error: ' . $e->getMessage());
            return response()->json(['error' => 'Server error', 'details' => $e->getMessage()], 500);
        }
    }

    public function getTips(Request $request)
    {
        $lang = $request->query('lang', 'en');

        $openaiKey = env('OPENAI_API_KEY');

        if (!$openaiKey) {
            return response()->json(['error' => 'API key missing'], 500);
        }

        try {
            $prompt = $lang === 'ar'
                ? "أعطني 8 نصائح تغذية مهمة للأطفال. كل نصيحة يجب أن تكون مفيدة وعملية. أرجع JSON فقط: {\"tips\": [\"نصيحة 1\", \"نصيحة 2\", ...]}"
                : "Give me 8 important nutrition tips for children. Each tip should be practical and helpful. Return JSON only: {\"tips\": [\"tip 1\", \"tip 2\", ...]}";

            $resp = Http::withToken($openaiKey)
                ->timeout(15)
                ->post('https://api.openai.com/v1/chat/completions', [
                    'model' => 'gpt-4o-mini',
                    'messages' => [
                        ['role' => 'system', 'content' => 'You are a child nutrition expert. Return ONLY valid JSON.'],
                        ['role' => 'user', 'content' => $prompt],
                    ],
                    'temperature' => 0.7,
                    'max_tokens' => 600,
                    'response_format' => ['type' => 'json_object']
                ]);

            if (!$resp->successful()) {
                return response()->json(['error' => 'Failed to get tips'], 500);
            }

            $content = $resp->json('choices.0.message.content');
            $data = json_decode($content, true);

            return response()->json([
                'success' => true,
                'tips' => array_slice($data['tips'] ?? [], 0, 8)
            ]);
        } catch (\Exception $e) {
            Log::error('Tips error: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    private function buildSystemPrompt($lang)
    {
        if ($lang === 'ar') {
            return "أنت خبير تغذية أطفال متخصص.

القواعد المهمة:
- كل الوصفات يجب أن تكون مناسبة للأطفال من عمر 3-10 سنوات
- استخدم مكونات صحية ومحببة للأطفال
- تجنب الأطعمة الحارة والتوابل القوية
- اجعل الوصفات سهلة وسريعة (15-30 دقيقة)
- اجعل الألوان متنوعة وجذابة
- قلل السكر والملح
- أضف عنصر المرح والجاذبية

أرجع JSON فقط بهذا الشكل:
{
  \"recipes\": [
    {
      \"title\": \"اسم الوصفة\",
      \"titleAr\": \"اسم الوصفة بالعربي\",
      \"description\": \"وصف مختصر جذاب للأطفال\",
      \"category\": \"فطور/غداء/عشاء/سناك\",
      \"categoryAr\": \"التصنيف بالعربي\",
      \"age_range\": \"3-10\",
      \"ingredients\": [\"مكون 1\", \"مكون 2\"],
      \"instructions\": \"خطوات واضحة وبسيطة\",
      \"instructionsAr\": \"الخطوات بالعربي\",
      \"time\": \"20\",
      \"servings\": 2,
      \"difficulty\": \"سهل\",
      \"calories\": 250,
      \"protein\": \"12g\",
      \"benefits\": \"الفوائد الصحية\",
      \"kid_friendly_tip\": \"نصيحة لجعل الطفل يحب الوجبة\"
    }
  ]
}";
        }

        return "You are a children's nutrition expert.

Important rules:
- All recipes must be suitable for kids aged 3-10 years
- Use healthy ingredients that kids love
- Avoid spicy foods and strong spices
- Keep recipes easy and quick (15-30 minutes)
- Make colors varied and attractive
- Reduce sugar and salt
- Add fun and appeal

Return ONLY JSON in this format:
{
  \"recipes\": [
    {
      \"title\": \"Recipe Name\",
      \"titleAr\": \"Arabic name\",
      \"description\": \"Short kid-friendly description\",
      \"category\": \"Breakfast/Lunch/Dinner/Snack\",
      \"categoryAr\": \"Arabic category\",
      \"age_range\": \"3-10\",
      \"ingredients\": [\"ingredient 1\", \"ingredient 2\"],
      \"instructions\": \"Clear simple steps\",
      \"instructionsAr\": \"Arabic instructions\",
      \"time\": \"20\",
      \"servings\": 2,
      \"difficulty\": \"Easy\",
      \"calories\": 250,
      \"protein\": \"12g\",
      \"benefits\": \"Health benefits\",
      \"kid_friendly_tip\": \"Tip to make kids love it\"
    }
  ]
}";
    }

    private function buildUserPrompt($lang)
    {
        if ($lang === 'ar') {
            return "أنشئ 12 وصفة مختلفة تماماً للأطفال تشمل:
- 3 وجبات فطور (بان كيك، شوفان بالفواكه، ساندويش جبن)
- 3 وجبات غداء (مكرونة بالجبن، دجاج مشوي مع خضار، برغر صحي)
- 3 وجبات عشاء خفيفة (حساء خضار، بيتزا صحية صغيرة، تورتيلا)
- 3 سناكات صحية (فواكه مقطعة، كرات الطاقة، زبادي بالعسل)

كل وصفة يجب أن تكون مغذية ولذيذة ومحببة للأطفال.";
        }

        return "Generate 12 completely different kids recipes including:
- 3 breakfast meals (pancakes, oatmeal with fruits, cheese sandwich)
- 3 lunch meals (mac & cheese, grilled chicken with veggies, healthy burger)
- 3 light dinner meals (veggie soup, mini healthy pizza, tortilla)
- 3 healthy snacks (fruit platter, energy balls, yogurt with honey)

Each recipe must be nutritious, delicious and kid-friendly.";
    }

    private function extractRecipesJson($content)
    {
        $trim = trim($content);

        $decoded = json_decode($trim, true);
        if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
            if (isset($decoded['recipes'])) {
                return $decoded;
            }
            if (isset($decoded[0]['title'])) {
                return ['recipes' => $decoded];
            }
        }

        if (preg_match('/```(?:json)?\s*(\{.*?\})\s*```/s', $content, $m)) {
            $decoded = json_decode($m[1], true);
            if (json_last_error() === JSON_ERROR_NONE) {
                return isset($decoded['recipes']) ? $decoded : ['recipes' => $decoded];
            }
        }

        if (preg_match('/\{[\s\S]*"recipes"[\s\S]*\]/s', $content, $m)) {
            $decoded = json_decode($m[0], true);
            if (json_last_error() === JSON_ERROR_NONE) {
                return $decoded;
            }
        }

        return null;
    }

    private function getRecipeImage($title, $ingredients)
    {
        $keywords = $this->buildSmartKeywords($title, $ingredients);

        Log::info("Searching images: {$keywords}");

        $pexels = $this->fetchFromPexels($keywords);
        if ($pexels) return $pexels;

        $unsplash = $this->fetchFromUnsplash($keywords);
        if ($unsplash) return $unsplash;

        return "https://source.unsplash.com/800x600/?kids-food,healthy," . urlencode(substr($title, 0, 20));
    }

    private function buildSmartKeywords($title, $ingredients)
    {
        $keywords = [];

        $cleanTitle = strtolower(trim($title));
        $cleanTitle = preg_replace('/[^\p{L}\p{N}\s]/u', ' ', $cleanTitle);

        $dishTranslations = [
            'بان كيك' => 'pancakes kids colorful',
            'شوفان' => 'oatmeal kids breakfast',
            'ساندويش' => 'sandwich kids healthy',
            'مكرونة' => 'pasta kids mac cheese',
            'دجاج' => 'chicken grilled kids',
            'برغر' => 'burger kids healthy',
            'بيتزا' => 'pizza kids mini',
            'حساء' => 'soup kids vegetables',
            'فواكه' => 'fruit platter kids colorful',
            'زبادي' => 'yogurt kids parfait',
        ];

        foreach ($dishTranslations as $ar => $en) {
            if (str_contains($cleanTitle, $ar)) {
                $keywords[] = $en;
                break;
            }
        }

        $keywords[] = "kids food";
        $keywords[] = "healthy meal";
        $keywords[] = "colorful plate";

        $final = implode(' ', array_unique(array_filter($keywords)));
        return trim(substr($final, 0, 100));
    }

    private function fetchFromPexels($keywords)
    {
        $key = env('PEXELS_API_KEY');
        if (!$key) return null;

        try {
            $response = Http::withHeaders(['Authorization' => $key])
                ->timeout(8)
                ->get("https://api.pexels.com/v1/search", [
                    'query' => $keywords,
                    'per_page' => 15,
                    'orientation' => 'landscape'
                ]);

            if ($response->successful()) {
                $photos = $response->json('photos') ?? [];
                if (!empty($photos)) {
                    $pick = $photos[array_rand(array_slice($photos, 0, 5))];
                    return $pick['src']['large'] ?? null;
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
            $response = Http::timeout(8)
                ->get("https://api.unsplash.com/search/photos", [
                    'query' => $keywords,
                    'per_page' => 15,
                    'orientation' => 'landscape',
                    'client_id' => $key
                ]);

            if ($response->successful()) {
                $results = $response->json('results') ?? [];
                if (!empty($results)) {
                    $pick = $results[array_rand(array_slice($results, 0, 5))];
                    return $pick['urls']['regular'] ?? null;
                }
            }
        } catch (\Exception $e) {
            Log::warning("Unsplash error: " . $e->getMessage());
        }

        return null;
    }
}
