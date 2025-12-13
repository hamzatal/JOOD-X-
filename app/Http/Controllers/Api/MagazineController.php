<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class MagazineController extends Controller
{
    public function getArticles(Request $request)
    {
        try {
            $category = $request->input('category', 'all');
            $lang = $request->input('lang', 'ar');

            Log::info("Magazine request: category={$category}, lang={$lang}");

            $articles = $this->generateArticlesFromAI($category, $lang);

            return response()->json([
                'success' => true,
                'data' => $articles,
            ]);
        } catch (\Exception $e) {
            Log::error('Magazine API Error', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);

            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function refreshArticles(Request $request)
    {
        $category = $request->input('category', 'all');
        $lang = $request->input('lang', 'ar');

        Cache::forget("magazine_articles_{$category}_{$lang}");

        return response()->json(['success' => true]);
    }

    private function generateArticlesFromAI($category, $lang)
    {
        $cacheKey = "magazine_articles_{$category}_{$lang}";

        return Cache::remember($cacheKey, 3600, function () use ($category, $lang) {
            $apiKey = env('OPENAI_API_KEY');

            if (empty($apiKey)) {
                throw new \Exception('OpenAI API key not configured in .env');
            }

            $prompt = $this->buildPrompt($category, $lang);

            Log::info('Calling OpenAI API...');

            try {
                $response = Http::timeout(60)
                    ->withToken($apiKey)
                    ->post('https://api.openai.com/v1/chat/completions', [
                        'model' => 'gpt-4o-mini',
                        'messages' => [
                            [
                                'role' => 'system',
                                'content' => 'You are a professional cooking magazine writer. Return ONLY a valid JSON array, no markdown, no explanations.'
                            ],
                            [
                                'role' => 'user',
                                'content' => $prompt
                            ]
                        ],
                        'temperature' => 0.7,
                        'max_tokens' => 3500,
                    ]);

                if ($response->failed()) {
                    $error = $response->json();
                    Log::error('OpenAI API failed', ['error' => $error]);
                    throw new \Exception('OpenAI API request failed: ' . ($error['error']['message'] ?? 'Unknown error'));
                }

                $content = $response->json('choices.0.message.content', '');

                if (empty($content)) {
                    throw new \Exception('Empty response from OpenAI');
                }

                Log::info('OpenAI response received', ['length' => strlen($content)]);

                $articlesData = $this->parseJSON($content);

                Log::info('Articles parsed successfully', ['count' => count($articlesData)]);

                return $this->enrichArticles($articlesData, $lang);
            } catch (\Illuminate\Http\Client\ConnectionException $e) {
                throw new \Exception('Network error connecting to OpenAI: ' . $e->getMessage());
            }
        });
    }

    private function buildPrompt($category, $lang)
    {
        $count = 9;

        $prompts = [
            'all' => 'Write 9 diverse cooking articles (mix of news, tips, secrets, health, trends)',
            'news' => 'Write 9 recent cooking news articles',
            'tips' => 'Write 9 professional cooking tips articles',
            'secrets' => 'Write 9 cooking secrets from professional chefs',
            'health' => 'Write 9 articles about healthy cooking and food benefits',
            'trends' => 'Write 9 articles about latest cooking trends',
        ];

        $basePrompt = $prompts[$category] ?? $prompts['all'];

        if ($lang === 'ar') {
            $basePrompt = 'اكتب 9 مقالات عن الطبخ (' . ($category === 'all' ? 'متنوعة' : $category) . ')';
        }

        $exampleCategory = $category === 'all' ? 'news' : $category;

        return $basePrompt . "\n\nReturn ONLY this JSON format (no markdown, no code blocks):\n\n" .
            '[
  {
    "title": "' . ($lang === 'ar' ? 'عنوان المقال' : 'Article Title') . '",
    "excerpt": "' . ($lang === 'ar' ? 'ملخص قصير في 2-3 جمل' : 'Short summary in 2-3 sentences') . '",
    "content": "' . ($lang === 'ar' ? 'المحتوى الكامل 200-300 كلمة' : 'Full content 200-300 words') . '",
    "category": "' . $exampleCategory . '",
    "tips": ["' . ($lang === 'ar' ? 'نصيحة 1' : 'tip 1') . '", "' . ($lang === 'ar' ? 'نصيحة 2' : 'tip 2') . '", "' . ($lang === 'ar' ? 'نصيحة 3' : 'tip 3') . '"]
  }
]';
    }

    private function parseJSON($content)
    {
        // Clean markdown
        $content = str_replace('``` json', '', $content);
        $content = str_replace('```', '', $content);
        $content = trim($content);

        // Try direct decode
        $data = json_decode($content, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            Log::warning('First JSON decode failed: ' . json_last_error_msg());

            // Try to extract array
            if (preg_match('/\[[\s\S]*\]/', $content, $matches)) {
                $data = json_decode($matches[0], true);

                if (json_last_error() !== JSON_ERROR_NONE) {
                    Log::error('Second JSON decode failed: ' . json_last_error_msg());
                    Log::error('Content preview: ' . substr($content, 0, 500));
                    throw new \Exception('JSON parse error: ' . json_last_error_msg());
                }
            } else {
                Log::error('No JSON array found');
                Log::error('Content preview: ' . substr($content, 0, 500));
                throw new \Exception('No valid JSON array found in response');
            }
        }

        if (!is_array($data) || empty($data)) {
            throw new \Exception('Invalid or empty articles array');
        }

        return $data;
    }

    private function enrichArticles($articles, $lang)
    {
        $icons = [
            'news' => 'Newspaper',
            'tips' => 'Lightbulb',
            'secrets' => 'Award',
            'health' => 'Heart',
            'trends' => 'TrendingUp',
        ];

        $labels = [
            'news' => $lang === 'ar' ? 'أخبار' : 'News',
            'tips' => $lang === 'ar' ? 'نصائح' : 'Tips',
            'secrets' => $lang === 'ar' ? 'أسرار' : 'Secrets',
            'health' => $lang === 'ar' ? 'صحة' : 'Health',
            'trends' => $lang === 'ar' ? 'صيحات' : 'Trends',
        ];

        // Real food images from Unsplash
        $foodImages = [
            'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80',
            'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80',
            'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80',
            'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&q=80',
            'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&q=80',
            'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=800&q=80',
            'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=800&q=80',
            'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=800&q=80',
            'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&q=80',
        ];

        return array_map(function ($article, $index) use ($icons, $labels, $lang, $foodImages) {
            $category = $article['category'] ?? 'news';

            return [
                'id' => $index,
                'title' => $article['title'] ?? 'Untitled',
                'excerpt' => $article['excerpt'] ?? '',
                'content' => $article['content'] ?? '',
                'category' => $category,
                'icon' => $icons[$category] ?? 'Newspaper',
                'categoryLabel' => $labels[$category] ?? $labels['news'],
                'date' => now()->format('d M Y'),
                'readTime' => $lang === 'ar' ? '5 دقائق' : '5 min read',
                'tips' => $article['tips'] ?? [],
                'image' => $foodImages[$index % count($foodImages)]
            ];
        }, $articles, array_keys($articles));
    }
}
