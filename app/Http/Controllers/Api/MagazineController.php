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

        // Cache for 1 hour
        return Cache::remember($cacheKey, 3600, function () use ($category, $lang) {
            $apiKey = env('OPENAI_API_KEY');

            if (empty($apiKey)) {
                throw new \Exception('OpenAI API key not configured in .env');
            }

            $prompt = $this->buildPrompt($category, $lang);

            Log::info('Calling OpenAI API...');

            try {
                $response = Http::timeout(45) // Reduced from 60 to 45
                    ->withToken($apiKey)
                    ->post('https://api.openai.com/v1/chat/completions', [
                        'model' => 'gpt-4o-mini',
                        'messages' => [
                            [
                                'role' => 'system',
                                'content' => 'You are a professional cooking writer. Write concise articles. Return ONLY valid JSON array, no markdown.'
                            ],
                            [
                                'role' => 'user',
                                'content' => $prompt
                            ]
                        ],
                        'temperature' => 0.6, // Reduced for faster response
                        'max_tokens' => 2800, // Reduced from 3500
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
            } catch (\Illuminate\Http\Client\RequestException $e) {
                throw new \Exception('OpenAI request failed: ' . $e->getMessage());
            }
        });
    }

    private function buildPrompt($category, $lang)
    {
        $count = 6;

        $categoryInstructions = [
            'all' => $lang === 'ar'
                ? 'اكتب 6 مقالات متنوعة عن الطبخ (أخبار، نصائح، أسرار، صحة، صيحات)'
                : 'Write 6 diverse cooking articles (news, tips, secrets, health, trends)',
            'news' => $lang === 'ar'
                ? 'اكتب 6 مقالات عن أخبار الطبخ الحديثة'
                : 'Write 6 recent cooking news articles',
            'tips' => $lang === 'ar'
                ? 'اكتب 6 مقالات عن نصائح الطبخ الاحترافية'
                : 'Write 6 professional cooking tips articles',
            'secrets' => $lang === 'ar'
                ? 'اكتب 6 مقالات عن أسرار الطبخ من الشيفات'
                : 'Write 6 cooking secrets from chefs',
            'health' => $lang === 'ar'
                ? 'اكتب 6 مقالات عن الطبخ الصحي وفوائد الأطعمة'
                : 'Write 6 articles about healthy cooking',
            'trends' => $lang === 'ar'
                ? 'اكتب 6 مقالات عن صيحات الطبخ الحديثة'
                : 'Write 6 articles about latest cooking trends',
        ];

        $instruction = $categoryInstructions[$category] ?? $categoryInstructions['all'];

        $lengthInstruction = $lang === 'ar'
            ? 'كل مقال 150-200 كلمة. نصيحتين فقط.'
            : 'Each article 150-200 words. Only 2 tips.';

        $exampleCategory = $category === 'all' ? 'news' : $category;

        $jsonTemplate = [
            [
                'title' => $lang === 'ar' ? 'عنوان المقال' : 'Article Title',
                'excerpt' => $lang === 'ar' ? 'ملخص في جملتين' : 'Summary in 2 sentences',
                'content' => $lang === 'ar' ? 'المحتوى الكامل 150-200 كلمة' : 'Full content 150-200 words',
                'category' => $exampleCategory,
                'tips' => [
                    $lang === 'ar' ? 'نصيحة 1' : 'tip 1',
                    $lang === 'ar' ? 'نصيحة 2' : 'tip 2'
                ]
            ]
        ];

        return $instruction . ' ' . $lengthInstruction . "\n\n" .
            "Return ONLY this JSON format (no markdown):\n" .
            json_encode($jsonTemplate, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    }

    private function parseJSON($content)
    {
        // Remove markdown code blocks
        $content = preg_replace('/```\s*/', '', $content);
        $content = preg_replace('/```\s*/', '', $content);
        $content = trim($content);

        // Try direct decode
        $data = json_decode($content, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            Log::warning('First JSON decode failed: ' . json_last_error_msg());

            // Try to extract JSON array using regex
            if (preg_match('/\[[\s\S]*\]/s', $content, $matches)) {
                $data = json_decode($matches[0], true);

                if (json_last_error() !== JSON_ERROR_NONE) {
                    Log::error('Second JSON decode failed', [
                        'error' => json_last_error_msg(),
                        'content_preview' => substr($content, 0, 500)
                    ]);
                    throw new \Exception('JSON parse error: ' . json_last_error_msg());
                }
            } else {
                Log::error('No JSON array found', [
                    'content_preview' => substr($content, 0, 500)
                ]);
                throw new \Exception('No valid JSON array found in response');
            }
        }

        if (!is_array($data) || empty($data)) {
            Log::error('Invalid data structure', ['data' => $data]);
            throw new \Exception('Invalid or empty articles array');
        }

        // Validate each article has required fields
        foreach ($data as $index => $article) {
            if (!isset($article['title']) || !isset($article['content'])) {
                Log::warning("Article {$index} missing required fields", ['article' => $article]);
            }
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
            'trends' => $lang === 'ar' ? 'ترندات' : 'Trends',
        ];

        // Real food images from Unsplash (6 images)
        $foodImages = [
            'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80',
            'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80',
            'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80',
            'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&q=80',
            'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&q=80',
            'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=800&q=80',
        ];

        return array_map(function ($article, $index) use ($icons, $labels, $lang, $foodImages) {
            $category = $article['category'] ?? 'news';

            return [
                'id' => $index + 1,
                'title' => $article['title'] ?? 'Untitled',
                'excerpt' => $article['excerpt'] ?? '',
                'content' => $article['content'] ?? '',
                'category' => $category,
                'icon' => $icons[$category] ?? 'Newspaper',
                'categoryLabel' => $labels[$category] ?? $labels['news'],
                'date' => now()->format('d M Y'),
                'readTime' => $lang === 'ar' ? '3 دقائق' : '3 min read', // Changed from 5 to 3
                'tips' => array_slice($article['tips'] ?? [], 0, 2), // Only 2 tips
                'image' => $foodImages[$index % count($foodImages)]
            ];
        }, $articles, array_keys($articles));
    }
}
