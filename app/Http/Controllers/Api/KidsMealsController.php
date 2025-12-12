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
            Log::info("Kids Meals Request", [
                'lang' => $lang,
                'category' => $category,
                'refresh' => $refresh
            ]);

            // مفتاح الكاش
            $cacheKey = "kids_meals_{$lang}_{$category}";
            $historyKey = "kids_meals_history_{$lang}_{$category}";

            // مسح الكاش عند التحديث
            if ($refresh) {
                Cache::forget($cacheKey);
                Log::info("Cache cleared: {$cacheKey}");
            }

            // استرجاع من الكاش إذا موجود
            if (!$refresh && Cache::has($cacheKey)) {
                Log::info("Serving from cache: {$cacheKey}");
                return response()->json([
                    'success' => true,
                    'recipes' => Cache::get($cacheKey)
                ]);
            }

            // التحقق من وجود API key
            $apiKey = env('OPENAI_API_KEY');
            if (!$apiKey) {
                Log::error('OpenAI API key is missing');
                return response()->json([
                    'success' => false,
                    'error' => 'API configuration error',
                    'recipes' => []
                ], 500);
            }

            // جلب تاريخ الوصفات السابقة
            $previousRecipes = Cache::get($historyKey, []);

            // محاولة جلب الوصفات
            $recipes = null;
            $lastError = null;
            for ($attempt = 1; $attempt <= 3; $attempt++) {
                Log::info("Attempt {$attempt} to generate recipes");
                try {
                    $recipes = $this->callOpenAI($apiKey, $lang, $category, $previousRecipes);
                    if ($recipes && count($recipes) >= 8) {
                        Log::info("Successfully generated " . count($recipes) . " recipes");
                        break;
                    }
                } catch (\Exception $e) {
                    $lastError = $e->getMessage();
                    Log::warning("Attempt {$attempt} failed: " . $lastError);
                    if ($attempt < 3) {
                        sleep(2);
                    }
                }
            }

            if (!$recipes || count($recipes) < 8) {
                Log::error('Failed to generate recipes: ' . ($lastError ?? 'Unknown error'));
                return response()->json([
                    'success' => false,
                    'error' => 'Unable to generate recipes',
                    'recipes' => []
                ], 500);
            }

            // تخزين في الكاش
            Cache::put($cacheKey, $recipes, 7200); // ساعتين

            // تحديث التاريخ
            $newHistory = array_merge($previousRecipes, array_column($recipes, 'title'));
            $newHistory = array_slice(array_unique($newHistory), -50);
            Cache::put($historyKey, $newHistory, 86400); // 24 ساعة

            return response()->json([
                'success' => true,
                'recipes' => $recipes
            ]);
        } catch (\Exception $e) {
            Log::error('Fatal error in index: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'success' => false,
                'error' => 'Server error occurred',
                'message' => config('app.debug') ? $e->getMessage() : 'Internal server error',
                'recipes' => []
            ], 500);
        }
    }

    private function callOpenAI($apiKey, $lang, $category, $previousRecipes = [])
    {
        $prompt = $this->buildPrompt($lang, $category, $previousRecipes);
        Log::info("Calling OpenAI API", ['lang' => $lang, 'category' => $category]);

        $response = Http::withToken($apiKey)
            ->timeout(90)
            ->retry(3, 1000)
            ->post('https://api.openai.com/v1/chat/completions', [
                'model' => 'gpt-4o-mini',
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'You are a professional nutritionist specializing in healthy children\'s meals. Always respond with valid JSON only.'
                    ],
                    [
                        'role' => 'user',
                        'content' => $prompt
                    ]
                ],
                'temperature' => 0.9,
                'max_tokens' => 4000,
                'presence_penalty' => 1.5,
                'frequency_penalty' => 1.5,
                'response_format' => ['type' => 'json_object']
            ]);

        if (!$response->successful()) {
            $statusCode = $response->status();
            $errorBody = $response->body();
            Log::error("OpenAI API failed", [
                'status' => $statusCode,
                'body' => $errorBody
            ]);
            throw new \Exception("OpenAI API request failed with status: {$statusCode}");
        }

        $content = $response->json('choices.0.message.content', '');
        if (empty($content)) {
            throw new \Exception('Empty response from OpenAI');
        }

        $data = json_decode($content, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new \Exception('Invalid JSON response: ' . json_last_error_msg());
        }

        if (!isset($data['recipes']) || !is_array($data['recipes'])) {
            throw new \Exception('Response missing recipes array');
        }

        return $this->processRecipes($data['recipes'], $lang);
    }

    private function buildPrompt($lang, $category, $previousRecipes = [])
    {
        $categoryFilter = '';
        $categories = [
            'breakfast' => ['ar' => 'فطور', 'en' => 'Breakfast'],
            'lunch' => ['ar' => 'غداء', 'en' => 'Lunch'],
            'dinner' => ['ar' => 'عشاء', 'en' => 'Dinner'],
            'snack' => ['ar' => 'سناك', 'en' => 'Snack'],
        ];

        if ($category !== 'all' && isset($categories[$category])) {
            $catName = $categories[$category][$lang];
            $categoryFilter = $lang === 'ar'
                ? "\n- **جميع الوصفات يجب أن تكون من فئة {$catName} فقط**"
                : "\n- **All recipes MUST be {$catName} category only**";
        }

        $avoidList = '';
        if (!empty($previousRecipes)) {
            $avoid = implode('، ', array_slice($previousRecipes, -20));
            $avoidList = $lang === 'ar'
                ? "\n\n⚠️ **يُمنع تكرار هذه الوصفات تماماً:** {$avoid}. أنشئ وصفات جديدة فريدة فقط."
                : "\n\n⚠️ **DO NOT repeat these recipes at all:** {$avoid}. Generate completely new and unique recipes only.";
        }

        if ($lang === 'ar') {
            return "أنشئ 8 وصفات عربية صحية مبتكرة وجديدة تماماً للأطفال (3-10 سنوات).{$categoryFilter}{$avoidList}
**متطلبات صارمة:**
- وصفات عربية وشرق أوسطية فقط (لبنانية، سورية، مصرية، خليجية، مغاربية)
- **يجب أن تكون كل وصفة فريدة وغير مكررة تماماً**
- بسيطة وآمنة ومحببة للأطفال
- **ممنوع استخدام أي توابل حارة**
- تعليمات واضحة ومفصلة (5-7 خطوات)
- الحصص: 2-4 أطفال
**JSON فقط:**
{
  \"recipes\": [
    {
      \"title\": \"Cheese Manakish\",
      \"titleAr\": \"مناقيش الجبنة البيضاء\",
      \"description\": \"مناقيش لذيذة بالجبنة البيضاء\",
      \"category\": \"Breakfast\",
      \"categoryAr\": \"فطور\",
      \"ingredients\": [\"عجينة طرية\", \"جبنة بيضاء\", \"زيت زيتون\"],
      \"instructions\": \"خطوة 1: سخن الفرن على 200 درجة\\n\\nخطوة 2: افرد العجينة\\n\\nخطوة 3: وزع الجبنة\\n\\nخطوة 4: اخبز 15 دقيقة\",
      \"time\": \"25\",
      \"servings\": 3,
      \"difficulty\": \"سهل\",
      \"calories\": 220,
      \"protein\": \"12g\",
      \"benefits\": \"غني بالكالسيوم\",
      \"kid_friendly_tip\": \"قطعها أشكال مرحة\"
    }
  ]
}";
        }

        return "Create 8 completely NEW and UNIQUE healthy Western recipes for kids (3-10 years).{$categoryFilter}{$avoidList}
**Strict Requirements:**
- Western/International cuisine only
- **Each recipe MUST be completely unique**
- Simple, safe, and kid-approved
- **NO spicy ingredients**
- Clear instructions (5-7 steps)
- Servings: 2-4 kids
**JSON only:**
{
  \"recipes\": [
    {
      \"title\": \"Rainbow Veggie Pasta\",
      \"titleAr\": \"معكرونة الخضار الملونة\",
      \"description\": \"Colorful pasta with vegetables\",
      \"category\": \"Lunch\",
      \"categoryAr\": \"غداء\",
      \"ingredients\": [\"pasta\", \"tomatoes\", \"peppers\", \"olive oil\"],
      \"instructions\": \"Step 1: Boil pasta\\n\\nStep 2: Chop vegetables\\n\\nStep 3: Sauté vegetables\\n\\nStep 4: Mix together\",
      \"time\": \"20\",
      \"servings\": 3,
      \"difficulty\": \"Easy\",
      \"calories\": 280,
      \"protein\": \"9g\",
      \"benefits\": \"Rich in vitamins\",
      \"kid_friendly_tip\": \"Let kids pick veggie colors\"
    }
  ]
}";
    }

    private function processRecipes($recipes, $lang)
    {
        $result = [];
        foreach (array_slice($recipes, 0, 8) as $index => $r) {
            if (empty($r['title']) || empty($r['ingredients']) || empty($r['instructions'])) {
                continue;
            }

            $title = trim($r['title']);
            $titleAr = isset($r['titleAr']) ? trim($r['titleAr']) : $title;

            $ingredients = [];
            if (is_array($r['ingredients'])) {
                foreach ($r['ingredients'] as $ing) {
                    if (is_string($ing) && !empty(trim($ing))) {
                        $ingredients[] = trim($ing);
                    }
                }
            }
            if (count($ingredients) < 2) {
                continue;
            }

            $instructions = '';
            if (is_string($r['instructions'])) {
                $instructions = trim($r['instructions']);
            } elseif (is_array($r['instructions'])) {
                $steps = [];
                foreach ($r['instructions'] as $i => $step) {
                    $prefix = $lang === 'ar' ? 'خطوة ' : 'Step ';
                    $steps[] = $prefix . ($i + 1) . ': ' . trim($step);
                }
                $instructions = implode("\n\n", $steps);
            }
            if (empty($instructions)) {
                continue;
            }

            $image = $this->getRecipeImage($title, $titleAr, $lang);

            $result[] = [
                'id' => (string) Str::uuid(),
                'title' => $title,
                'titleAr' => $titleAr,
                'description' => isset($r['description']) ? trim($r['description']) : '',
                'category' => $r['category'] ?? ($lang === 'ar' ? 'وجبة' : 'Meal'),
                'categoryAr' => $r['categoryAr'] ?? 'وجبة',
                'time' => (string) ($r['time'] ?? '20'),
                'servings' => (int) ($r['servings'] ?? 3),
                'difficulty' => $r['difficulty'] ?? ($lang === 'ar' ? 'سهل' : 'Easy'),
                'age_range' => '3-10',
                'ingredients' => $ingredients,
                'instructions' => $instructions,
                'instructionsAr' => $instructions,
                'calories' => (int) ($r['calories'] ?? rand(180, 350)),
                'protein' => $r['protein'] ?? rand(8, 15) . 'g',
                'benefits' => $r['benefits'] ?? '',
                'kid_friendly_tip' => $r['kid_friendly_tip'] ?? '',
                'image' => $image,
                'rating' => round(4.3 + (rand(0, 7) / 10), 1),
            ];
        }

        return $result;
    }

    private function getRecipeImage($title, $titleAr, $lang)
    {
        $query = $lang === 'ar' ? $titleAr : $title;
        return "https://source.unsplash.com/featured/800x600?" . urlencode($query . ' kids meal healthy');
    }

    public function getTips(Request $request)
    {
        try {
            $lang = $request->query('lang', 'en') === 'ar' ? 'ar' : 'en';
            $cacheKey = "kids_nutrition_tips_{$lang}";

            if (Cache::has($cacheKey)) {
                return response()->json([
                    'success' => true,
                    'tips' => Cache::get($cacheKey)
                ]);
            }

            $apiKey = env('OPENAI_API_KEY');
            if (!$apiKey) {
                Log::error('OpenAI API key is missing for tips');
                return response()->json([
                    'success' => false,
                    'error' => 'API configuration error',
                    'tips' => []
                ], 500);
            }

            $prompt = $lang === 'ar'
                ? 'أنشئ قائمة بـ 8 نصائح صحية مختصرة ومفيدة لتغذية الأطفال (3-10 سنوات) باللغة العربية. كل نصيحة في سطر واحد فقط. JSON فقط: {"tips": ["نصيحة 1", "نصيحة 2", ...]}'
                : 'Create a list of 8 brief nutrition tips for kids (3-10 years) in English. Each tip in one line. JSON only: {"tips": ["tip 1", "tip 2", ...]}';

            $response = Http::withToken($apiKey)
                ->timeout(30)
                ->retry(3, 1000)
                ->post('https://api.openai.com/v1/chat/completions', [
                    'model' => 'gpt-4o-mini',
                    'messages' => [['role' => 'user', 'content' => $prompt]],
                    'temperature' => 0.8,
                    'max_tokens' => 500,
                    'response_format' => ['type' => 'json_object']
                ]);

            if ($response->successful()) {
                $content = $response->json('choices.0.message.content', '');
                $data = json_decode($content, true);
                if (isset($data['tips']) && is_array($data['tips']) && count($data['tips']) >= 8) {
                    Cache::put($cacheKey, $data['tips'], 86400);
                    return response()->json(['success' => true, 'tips' => $data['tips']]);
                }
            }

            Log::warning('Failed to generate tips from API');
            return response()->json([
                'success' => false,
                'error' => 'Unable to generate tips',
                'tips' => []
            ], 500);
        } catch (\Exception $e) {
            Log::error('Error in getTips: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Server error occurred',
                'tips' => []
            ], 500);
        }
    }
}
