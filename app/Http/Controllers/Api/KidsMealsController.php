<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class KidsMealsController extends Controller
{
    public function index(Request $request)
    {
        $lang = $request->query('lang', 'en') === 'ar' ? 'ar' : 'en';
        $category = $request->query('category', 'all');

        Log::info("Request: lang={$lang}, category={$category}");

        $openaiKey = env('OPENAI_API_KEY');

        if (!$openaiKey) {
            return response()->json([
                'error' => 'OPENAI_API_KEY not found in .env',
                'recipes' => []
            ], 500);
        }

        try {
            $recipes = $this->generateRecipes($lang, $category, $openaiKey);

            if (empty($recipes)) {
                return response()->json([
                    'error' => 'No recipes generated',
                    'recipes' => []
                ], 500);
            }

            return response()->json(['recipes' => $recipes]);
        } catch (\Exception $e) {
            Log::error('ERROR: ' . $e->getMessage());
            Log::error('LINE: ' . $e->getLine());
            Log::error('FILE: ' . $e->getFile());

            return response()->json([
                'error' => $e->getMessage(),
                'line' => $e->getLine(),
                'recipes' => []
            ], 500);
        }
    }

    private function generateRecipes($lang, $category, $apiKey)
    {
        $prompt = $lang === 'ar'
            ? "أنشئ 12 وصفة عربية صحية للأطفال من 3-10 سنوات. كل وصفة يجب أن تحتوي على: عنوان، وصف، مكونات، تعليمات بسيطة. أرجع JSON فقط بهذا الشكل: {\"recipes\": [{\"title\": \"...\", \"titleAr\": \"...\", \"description\": \"...\", \"category\": \"Breakfast\", \"categoryAr\": \"فطور\", \"ingredients\": [...], \"instructions\": \"...\", \"time\": \"20\", \"servings\": 2, \"difficulty\": \"سهل\", \"calories\": 200, \"protein\": \"10g\", \"benefits\": \"...\", \"kid_friendly_tip\": \"...\"}]}"
            : "Create 12 healthy Western recipes for kids 3-10 years. Each must have: title, description, ingredients, simple instructions. Return only JSON: {\"recipes\": [{\"title\": \"...\", \"titleAr\": \"...\", \"description\": \"...\", \"category\": \"Breakfast\", \"categoryAr\": \"فطور\", \"ingredients\": [...], \"instructions\": \"...\", \"time\": \"20\", \"servings\": 2, \"difficulty\": \"Easy\", \"calories\": 200, \"protein\": \"10g\", \"benefits\": \"...\", \"kid_friendly_tip\": \"...\"}]}";

        Log::info('Calling OpenAI...');

        $response = Http::withToken($apiKey)
            ->timeout(60)
            ->post('https://api.openai.com/v1/chat/completions', [
                'model' => 'gpt-4o-mini',
                'messages' => [
                    ['role' => 'user', 'content' => $prompt]
                ],
                'temperature' => 0.9,
                'max_tokens' => 4000,
                'response_format' => ['type' => 'json_object']
            ]);

        if (!$response->successful()) {
            Log::error('OpenAI failed: ' . $response->status());
            Log::error('Response: ' . $response->body());
            throw new \Exception('OpenAI API failed: ' . $response->status());
        }

        $content = $response->json('choices.0.message.content');

        if (empty($content)) {
            throw new \Exception('Empty response from OpenAI');
        }

        $data = json_decode($content, true);

        if (!$data || !isset($data['recipes'])) {
            throw new \Exception('Invalid JSON from OpenAI');
        }

        Log::info('Got ' . count($data['recipes']) . ' recipes');

        return $this->processRecipes($data['recipes'], $lang);
    }

    private function processRecipes($recipes, $lang)
    {
        $processed = [];

        foreach ($recipes as $r) {
            $title = $r['title'] ?? 'Recipe';
            $titleAr = $r['titleAr'] ?? $title;

            $ingredients = [];
            if (isset($r['ingredients']) && is_array($r['ingredients'])) {
                foreach ($r['ingredients'] as $ing) {
                    if (is_string($ing)) {
                        $ingredients[] = trim($ing);
                    }
                }
            }

            $instructions = '';
            if (isset($r['instructions'])) {
                if (is_string($r['instructions'])) {
                    $instructions = $r['instructions'];
                } elseif (is_array($r['instructions'])) {
                    $steps = [];
                    foreach ($r['instructions'] as $idx => $step) {
                        $steps[] = "خطوة " . ($idx + 1) . ": " . $step;
                    }
                    $instructions = implode("\n\n", $steps);
                }
            }

            $image = $this->getImage($title, $titleAr, $lang);

            $processed[] = [
                'id' => (string) Str::uuid(),
                'title' => $title,
                'titleAr' => $titleAr,
                'description' => $r['description'] ?? '',
                'category' => $r['category'] ?? 'Snack',
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
                'rating' => 4.7,
            ];
        }

        return $processed;
    }

    private function getImage($title, $titleAr, $lang)
    {
        // استخدم Unsplash Source API (بدون key مطلوب)
        $keyword = $lang === 'ar' ? 'arabic food' : 'kids food';

        if (str_contains(strtolower($title), 'pancake')) $keyword = 'pancakes';
        if (str_contains(strtolower($title), 'pizza')) $keyword = 'pizza';
        if (str_contains(strtolower($title), 'pasta')) $keyword = 'pasta';
        if (str_contains(strtolower($titleAr), 'مناقيش')) $keyword = 'manakish';
        if (str_contains(strtolower($titleAr), 'حمص')) $keyword = 'hummus';
        if (str_contains(strtolower($titleAr), 'شاورما')) $keyword = 'shawarma';

        return "https://source.unsplash.com/800x600/?" . urlencode($keyword . ' food');
    }

    public function getTips(Request $request)
    {
        $lang = $request->query('lang', 'en');

        $tips = $lang === 'ar'
            ? [
                'قدم الخضروات والفواكه الملونة يومياً',
                'شجع الطفل على شرب الماء بانتظام',
                'قلل من السكريات والحلويات المصنعة',
                'اجعل وقت الطعام ممتعاً وبدون توتر',
                'كن قدوة حسنة في اختيار الأطعمة الصحية',
                'دع الطفل يساعد في تحضير الطعام',
                'قدم وجبات صغيرة متعددة خلال اليوم',
                'تحلى بالصبر عند تقديم أطعمة جديدة'
            ]
            : [
                'Offer colorful fruits and vegetables daily',
                'Encourage regular water drinking',
                'Limit sugar and processed sweets',
                'Make mealtime fun and stress-free',
                'Be a good role model for healthy eating',
                'Let kids help in the kitchen',
                'Provide small frequent meals',
                'Be patient with new foods'
            ];

        return response()->json([
            'success' => true,
            'tips' => $tips
        ]);
    }
}
