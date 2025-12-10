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
        try {
            $lang = $request->query('lang', 'en') === 'ar' ? 'ar' : 'en';
            $refresh = $request->query('refresh', 'false') === 'true';
            $category = $request->query('category', 'all');

            Log::info("Kids Meals: lang={$lang}, category={$category}, refresh={$refresh}");

            // Cache مختلف لكل لغة وكاتيجوري
            $cacheKey = "kids_meals_{$lang}_{$category}_v4";

            if ($refresh) {
                Cache::forget($cacheKey);
                Log::info("Cache cleared: {$cacheKey}");
            }

            if (Cache::has($cacheKey)) {
                Log::info("✓ Cache hit: {$cacheKey}");
                return response()->json(['recipes' => Cache::get($cacheKey)]);
            }

            $apiKey = env('OPENAI_API_KEY');
            if (!$apiKey) {
                return response()->json(['error' => 'API key missing', 'recipes' => []], 500);
            }

            // محاولتين
            $recipes = null;
            for ($attempt = 1; $attempt <= 2; $attempt++) {
                Log::info("→ Attempt {$attempt}");

                try {
                    $recipes = $this->callOpenAI($apiKey, $lang, $category);

                    if ($recipes && count($recipes) >= 6) {
                        Log::info("✓ Got " . count($recipes) . " recipes");
                        break;
                    }
                } catch (\Exception $e) {
                    Log::warning("✗ Attempt {$attempt}: " . $e->getMessage());
                    if ($attempt < 2) sleep(3);
                }
            }

            if (!$recipes || count($recipes) < 6) {
                return response()->json(['error' => 'Failed to generate', 'recipes' => []], 500);
            }

            // Cache لمدة ساعتين
            Cache::put($cacheKey, $recipes, 7200);

            return response()->json(['recipes' => $recipes]);
        } catch (\Exception $e) {
            Log::error("✗ Error: " . $e->getMessage());
            return response()->json(['error' => $e->getMessage(), 'recipes' => []], 500);
        }
    }

    private function callOpenAI($apiKey, $lang, $category)
    {
        $prompt = $this->buildPrompt($lang, $category);

        Log::info("Calling OpenAI for {$lang} - {$category}");

        $response = Http::withToken($apiKey)
            ->timeout(60)
            ->post('https://api.openai.com/v1/chat/completions', [
                'model' => 'gpt-4o-mini',
                'messages' => [['role' => 'user', 'content' => $prompt]],
                'temperature' => 0.8,
                'max_tokens' => 3500,
                'response_format' => ['type' => 'json_object']
            ]);

        if (!$response->successful()) {
            throw new \Exception('OpenAI failed: ' . $response->status());
        }

        $content = $response->json('choices.0.message.content', '');
        if (empty($content)) {
            throw new \Exception('Empty response');
        }

        $data = json_decode($content, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new \Exception('Invalid JSON');
        }

        if (!isset($data['recipes'])) {
            throw new \Exception('No recipes in response');
        }

        return $this->processRecipes($data['recipes'], $lang);
    }

    private function buildPrompt($lang, $category)
    {
        // تحديد نوع الوصفات حسب الكاتيجوري
        $categoryText = '';
        if ($category !== 'all') {
            $categories = [
                'breakfast' => ['ar' => 'فطور', 'en' => 'Breakfast'],
                'lunch' => ['ar' => 'غداء', 'en' => 'Lunch'],
                'dinner' => ['ar' => 'عشاء', 'en' => 'Dinner'],
                'snack' => ['ar' => 'سناك', 'en' => 'Snack'],
            ];
            $catName = $categories[$category][$lang] ?? 'All';
            $categoryText = $lang === 'ar'
                ? " **كل الوصفات يجب أن تكون من فئة {$catName} فقط**"
                : " **All recipes must be {$catName} category only**";
        }

        if ($lang === 'ar') {
            return "أنشئ 8 وصفات عربية صحية للأطفال 3-10 سنوات.{$categoryText}

شروط صارمة:
- **وصفات عربية وشرق أوسطية فقط** (لبنانية، سورية، مصرية، خليجية)
- بسيطة وآمنة للأطفال
- **بدون توابل حارة إطلاقاً**
- تعليمات واضحة (5-6 خطوات مفصلة)
- حصص: 1-3 أطفال

أمثلة وصفات مناسبة:
- مناقيش جبنة بيضاء
- معكرونة بصلصة طماطم خفيفة
- أرز بخضار ملونة  
- شوربة عدس ناعمة
- دجاج مشوي بنكهة بسيطة
- زبادي بالفواكه

**JSON فقط:**
{
  \"recipes\": [
    {
      \"title\": \"Cheese Manakish\",
      \"titleAr\": \"مناقيش الجبنة\",
      \"description\": \"مناقيش شهية بالجبنة للأطفال\",
      \"category\": \"Breakfast\",
      \"categoryAr\": \"فطور\",
      \"ingredients\": [\"عجينة\", \"جبنة بيضاء\", \"زيت زيتون\"],
      \"instructions\": \"خطوة 1: سخن الفرن 180 درجة لمدة 10 دقائق\\n\\nخطوة 2: افرد العجينة\\n\\nخطوة 3: ضع الجبنة\\n\\nخطوة 4: اخبز 15 دقيقة\",
      \"time\": \"25\",
      \"servings\": 2,
      \"difficulty\": \"سهل\",
      \"calories\": 200,
      \"protein\": \"10g\",
      \"benefits\": \"غني بالكالسيوم\",
      \"kid_friendly_tip\": \"قطعها أشكال مرحة\"
    }
  ]
}";
        }

        return "Create 8 healthy Western recipes for kids 3-10 years.{$categoryText}

Strict Requirements:
- **Western/International recipes only** (American, European, simple Asian-fusion)
- Simple and safe for kids
- **NO spicy ingredients at all**
- Clear instructions (5-6 detailed steps)
- Servings: 1-3 kids

Good examples:
- Fluffy pancakes with fruit
- Mac and cheese (mild)
- Simple pasta with tomato sauce
- Chicken nuggets (baked)
- Fruit smoothie bowl
- Yogurt parfait

**JSON only:**
{
  \"recipes\": [
    {
      \"title\": \"Fluffy Pancakes\",
      \"titleAr\": \"فطائر\",
      \"description\": \"Soft pancakes for kids\",
      \"category\": \"Breakfast\",
      \"categoryAr\": \"فطور\",
      \"ingredients\": [\"flour\", \"eggs\", \"milk\"],
      \"instructions\": \"Step 1: Mix flour and milk\\n\\nStep 2: Beat eggs\\n\\nStep 3: Combine all\\n\\nStep 4: Cook on pan\",
      \"time\": \"15\",
      \"servings\": 2,
      \"difficulty\": \"Easy\",
      \"calories\": 180,
      \"protein\": \"8g\",
      \"benefits\": \"Energy for kids\",
      \"kid_friendly_tip\": \"Use fun shapes\"
    }
  ]
}";
    }

    private function processRecipes($recipes, $lang)
    {
        $result = [];

        foreach (array_slice($recipes, 0, 8) as $r) {
            $title = $r['title'] ?? 'Recipe';
            $titleAr = $r['titleAr'] ?? $title;

            $ingredients = [];
            if (isset($r['ingredients']) && is_array($r['ingredients'])) {
                foreach ($r['ingredients'] as $ing) {
                    if (is_string($ing) && !empty(trim($ing))) {
                        $ingredients[] = trim($ing);
                    }
                }
            }

            if (empty($ingredients)) continue;

            $instructions = '';
            if (isset($r['instructions'])) {
                if (is_string($r['instructions'])) {
                    $instructions = trim($r['instructions']);
                } elseif (is_array($r['instructions'])) {
                    $steps = [];
                    foreach ($r['instructions'] as $i => $step) {
                        $prefix = $lang === 'ar' ? "خطوة " : "Step ";
                        $steps[] = $prefix . ($i + 1) . ": " . trim($step);
                    }
                    $instructions = implode("\n\n", $steps);
                }
            }

            if (empty($instructions)) continue;

            // الصورة الدقيقة
            $image = $this->getAccurateImage($title, $titleAr, $lang);

            $result[] = [
                'id' => (string) Str::uuid(),
                'title' => $title,
                'titleAr' => $titleAr,
                'description' => isset($r['description']) ? trim($r['description']) : '',
                'category' => $r['category'] ?? ($lang === 'ar' ? 'سناك' : 'Snack'),
                'categoryAr' => $r['categoryAr'] ?? 'سناك',
                'time' => (string)($r['time'] ?? '20'),
                'servings' => (int)($r['servings'] ?? 2),
                'difficulty' => $r['difficulty'] ?? ($lang === 'ar' ? 'سهل' : 'Easy'),
                'age_range' => '3-10',
                'ingredients' => $ingredients,
                'instructions' => $instructions,
                'instructionsAr' => $instructions,
                'calories' => (int)($r['calories'] ?? 200),
                'protein' => $r['protein'] ?? '10g',
                'benefits' => $r['benefits'] ?? '',
                'kid_friendly_tip' => $r['kid_friendly_tip'] ?? '',
                'image' => $image,
                'rating' => round(4.5 + (rand(0, 5) / 10), 1),
            ];
        }

        return $result;
    }

    private function getAccurateImage($title, $titleAr, $lang)
    {
        // صور دقيقة جداً لكل طبق
        $imageMap = [
            // عربي - صور دقيقة
            'مناقيش' => 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&q=80',
            'منقوشة' => 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&q=80',
            'جبنة' => 'https://images.unsplash.com/photo-1452195100486-9cc805987862?w=800&q=80',
            'فطيرة' => 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80',
            'لبنة' => 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&q=80',
            'حمص' => 'https://images.unsplash.com/photo-1571159666137-b4e0653770e0?w=800&q=80',
            'شوربة' => 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&q=80',
            'عدس' => 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800&q=80',
            'معكرونة' => 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&q=80',
            'أرز' => 'https://images.unsplash.com/photo-1516684732162-798a0062be99?w=800&q=80',
            'دجاج' => 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800&q=80',
            'فواكه' => 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=800&q=80',
            'زبادي' => 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&q=80',
            'سلطة' => 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80',
            'كبة' => 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800&q=80',
            'بطاطا' => 'https://images.unsplash.com/photo-1518013431117-eb1465fa5752?w=800&q=80',
            'عجة' => 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=800&q=80',
            'بيض' => 'https://images.unsplash.com/photo-1525351326368-efbb5cb6814d?w=800&q=80',

            // غربي - صور دقيقة
            'pancake' => 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80',
            'waffle' => 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=800&q=80',
            'french toast' => 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=800&q=80',
            'toast' => 'https://images.unsplash.com/photo-1525351326368-efbb5cb6814d?w=800&q=80',
            'omelette' => 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=800&q=80',
            'egg' => 'https://images.unsplash.com/photo-1525351326368-efbb5cb6814d?w=800&q=80',
            'mac' => 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800&q=80',
            'macaroni' => 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800&q=80',
            'cheese' => 'https://images.unsplash.com/photo-1452195100486-9cc805987862?w=800&q=80',
            'pizza' => 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80',
            'pasta' => 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&q=80',
            'spaghetti' => 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800&q=80',
            'chicken' => 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800&q=80',
            'nugget' => 'https://images.unsplash.com/photo-1562967914-608f82629710?w=800&q=80',
            'burger' => 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80',
            'sandwich' => 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800&q=80',
            'smoothie' => 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=800&q=80',
            'yogurt' => 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&q=80',
            'fruit' => 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=800&q=80',
            'salad' => 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80',
            'soup' => 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&q=80',
            'rice' => 'https://images.unsplash.com/photo-1516684732162-798a0062be99?w=800&q=80',
        ];

        $titleLower = mb_strtolower($title);
        $titleArLower = mb_strtolower($titleAr);
        $combined = $titleLower . ' ' . $titleArLower;

        // البحث عن تطابق دقيق
        foreach ($imageMap as $keyword => $url) {
            if (mb_strpos($combined, $keyword) !== false) {
                return $url;
            }
        }

        // صورة افتراضية حسب اللغة
        return $lang === 'ar'
            ? 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=800&q=80' // طعام عربي
            : 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80'; // طعام عام
    }

    public function getTips(Request $request)
    {
        $lang = $request->query('lang', 'en');

        $tips = $lang === 'ar'
            ? [
                'قدم الخضروات والفواكه الملونة يومياً',
                'شجع الطفل على شرب الماء بانتظام',
                'قلل السكريات والحلويات المصنعة',
                'اجعل وقت الطعام ممتعاً',
                'كن قدوة حسنة للطفل',
                'دع الطفل يساعد في المطبخ',
                'قدم وجبات صغيرة متعددة',
                'تحلى بالصبر مع الأطعمة الجديدة'
            ]
            : [
                'Offer colorful vegetables daily',
                'Encourage water drinking',
                'Limit processed sugars',
                'Make mealtime fun',
                'Be a good role model',
                'Let kids help cooking',
                'Small frequent meals',
                'Be patient with new foods'
            ];

        return response()->json(['success' => true, 'tips' => $tips]);
    }
}
