<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Carbon\Carbon;
use Illuminate\Pagination\LengthAwarePaginator;

class BlogController extends Controller
{
    private const CACHE_DURATION = 7200; // ثانيتان * 3600 = ساعتان (7200s)
    private const DEFAULT_PER_PAGE = 12;
    private const OPENAI_RETRY = 3;
    private const OPENAI_TIMEOUT = 30; // seconds per try

    public function index(Request $request)
    {
        try {
            $lang = $request->query('lang', 'en') === 'ar' ? 'ar' : 'en';
            $category = $request->query('category', 'all');
            $refresh = filter_var($request->query('refresh', 'false'), FILTER_VALIDATE_BOOLEAN);
            $page = max(1, (int) $request->query('page', 1));
            $perPage = max(1, min(50, (int) $request->query('per_page', self::DEFAULT_PER_PAGE)));

            Log::info('Blog request', compact('lang', 'category', 'refresh', 'page', 'perPage'));

            $cacheKey = "blog_articles_{$lang}_{$category}_page{$page}_per{$perPage}";

            if ($refresh) {
                Cache::forget($cacheKey);
                Log::info("Cache cleared: {$cacheKey}");
            }

            // Use cache remember to avoid race conditions
            $articles = Cache::remember($cacheKey, self::CACHE_DURATION, function () use ($lang, $category, $page, $perPage) {
                return $this->fetchArticlesWithFallback($lang, $category, $page, $perPage);
            });

            // Always return paginated shape (so frontend can use page/total)
            $total = count($articles);
            $paginator = $this->makePaginator($articles, $perPage, $page);

            return response()->json([
                'success' => true,
                'articles' => $paginator->items(),
                'meta' => [
                    'current_page' => $paginator->currentPage(),
                    'per_page' => $paginator->perPage(),
                    'total' => $paginator->total(),
                    'last_page' => $paginator->lastPage(),
                    'source' => Cache::has($cacheKey) ? 'cache_or_api' : 'api'
                ]
            ], 200);
        } catch (\Exception $e) {
            Log::error('BlogController index exception', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            $debugMessage = config('app.debug') ? $e->getMessage() : 'Internal server error';

            return response()->json([
                'success' => false,
                'error' => 'server_error',
                'message' => $debugMessage,
                'articles' => []
            ], 500);
        }
    }

    /**
     * High level: try to get articles from OpenAI; if fail -> fallback static templates
     */
    private function fetchArticlesWithFallback($lang, $category, $page, $perPage)
    {
        $apiKey = env('OPENAI_API_KEY');

        if (!$apiKey) {
            Log::error('OpenAI API key missing');
            return $this->fallbackArticles($lang, $category, $perPage);
        }

        // Try OpenAI with retries
        $lastException = null;
        for ($attempt = 1; $attempt <= self::OPENAI_RETRY; $attempt++) {
            try {
                Log::info("OpenAI attempt {$attempt}");
                $raw = $this->callOpenAi($apiKey, $lang, $category);
                $articles = $this->parseOpenAiResponse($raw, $lang);

                // Validate we have at least perPage articles (or at least 1)
                if (is_array($articles) && count($articles) >= 1) {
                    $processed = $this->processArticles($articles, $lang);
                    Log::info('OpenAI returned articles count: ' . count($processed));
                    // ensure unique IDs and limit to some reasonable number
                    return array_slice($processed, 0, max($perPage, self::DEFAULT_PER_PAGE));
                }

                Log::warning('OpenAI returned no usable articles or invalid format', ['raw' => substr($raw, 0, 1000)]);
            } catch (\Exception $e) {
                $lastException = $e;
                Log::warning('OpenAI attempt failed', ['attempt' => $attempt, 'error' => $e->getMessage()]);
            }

            // short backoff (non-blocking is ideal, but keep simple)
            sleep(1);
        }

        // If reached here -> fallback
        Log::error('OpenAI failed after attempts', ['error' => $lastException ? $lastException->getMessage() : 'unknown']);
        return $this->fallbackArticles($lang, $category, $perPage);
    }

    /**
     * Call OpenAI - centralised and robust
     */
    private function callOpenAi($apiKey, $lang, $category)
    {
        $prompt = $this->buildPrompt($lang, $category);

        // Use Http::withToken and retry built-in for network issues
        $response = Http::withToken($apiKey)
            ->timeout(self::OPENAI_TIMEOUT)
            ->acceptJson()
            ->retry(2, 100, function ($exception, $request) {
                // Retry on connection or server errors
                return $exception instanceof \Exception;
            })
            ->post('https://api.openai.com/v1/chat/completions', [
                'model' => 'gpt-4o-mini',
                'messages' => [
                    ['role' => 'system', 'content' => 'You are an expert nutrition and health writer. Return JSON only.'],
                    ['role' => 'user', 'content' => $prompt]
                ],
                'temperature' => 0.7,
                'max_tokens' => 1800
            ]);

        if (!$response->successful()) {
            $status = $response->status();
            $body = $response->body();
            throw new \Exception("OpenAI responded with status {$status}: " . substr($body, 0, 1000));
        }

        // Prefer canonical chat completion content path
        $json = $response->json();

        // Try to extract content safely:
        if (isset($json['choices'][0]['message']['content'])) {
            return $json['choices'][0]['message']['content'];
        }

        // fallback: legacy text
        if (isset($json['choices'][0]['text'])) {
            return $json['choices'][0]['text'];
        }

        // otherwise return full body as string (we'll try to parse)
        return $response->body();
    }

    /**
     * Try to parse OpenAI text into array of articles.
     * Supports responses that are:
     * - direct JSON object with articles[]
     * - code block-wrapped JSON (```json ... ```)
     * - raw JSON inside text
     */
    private function parseOpenAiResponse($raw, $lang)
    {
        // strip markdown code fences if present
        $str = trim($raw);
        // remove leading triple backticks and optional language label
        $str = preg_replace('/^```(?:json|text)?\s*/i', '', $str);
        $str = preg_replace('/\s*```$/', '', $str);

        // If contains other text before/after JSON, try to extract {...}
        if (($first = strpos($str, '{')) !== false && ($last = strrpos($str, '}')) !== false && $last > $first) {
            $jsonPart = substr($str, $first, $last - $first + 1);
        } else {
            $jsonPart = $str;
        }

        $data = json_decode($jsonPart, true);

        if (json_last_error() === JSON_ERROR_NONE && isset($data['articles']) && is_array($data['articles'])) {
            return $data['articles'];
        }

        // If parse failed, try to interpret as a list of objects (e.g., [ {...}, {...} ])
        $data2 = json_decode($jsonPart, true);
        if (json_last_error() === JSON_ERROR_NONE && is_array($data2)) {
            // If it's already an array of articles
            if (isset($data2[0]) && is_array($data2[0]) && isset($data2[0]['title'])) {
                return $data2;
            }
        }

        // Give up
        throw new \Exception('Unable to parse OpenAI response as JSON (json_error: ' . json_last_error_msg() . '). Raw start: ' . substr($raw, 0, 1000));
    }

    private function processArticles(array $articles, $lang)
    {
        $result = [];
        $authors = [
            ['name' => 'Dr. Sarah Ahmed', 'nameAr' => 'د. سارة أحمد', 'role' => 'Nutritionist', 'roleAr' => 'اختصاصية تغذية', 'avatar' => 'https://i.pravatar.cc/150?img=1'],
            ['name' => 'Chef Omar Ali', 'nameAr' => 'الشيف عمر علي', 'role' => 'Chef', 'roleAr' => 'شيف', 'avatar' => 'https://i.pravatar.cc/150?img=12'],
            ['name' => 'Dr. Layla Hassan', 'nameAr' => 'د. ليلى حسن', 'role' => 'Health Expert', 'roleAr' => 'خبيرة صحة', 'avatar' => 'https://i.pravatar.cc/150?img=5'],
            ['name' => 'Ahmed Khalil', 'nameAr' => 'أحمد خليل', 'role' => 'Fitness Coach', 'roleAr' => 'مدرب لياقة', 'avatar' => 'https://i.pravatar.cc/150?img=33'],
        ];

        $images = [
            'nutrition' => 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80',
            'recipes' => 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80',
            'health' => 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=800&q=80',
            'kids' => 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=800&q=80',
            'weightloss' => 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80',
            'fitness' => 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
        ];

        foreach ($articles as $index => $article) {
            // Skip if minimal fields missing
            if (!is_array($article) || empty($article['title']) || empty($article['content'])) {
                Log::warning("Skipping invalid article at index {$index}");
                continue;
            }

            $author = $authors[array_rand($authors)];
            $category = $article['category'] ?? 'nutrition';

            $result[] = [
                'id' => (string) Str::uuid(),
                'title' => $article['title'],
                'titleAr' => $article['titleAr'] ?? ($lang === 'ar' ? $article['title'] : ($article['titleAr'] ?? $article['title'])),
                'excerpt' => $article['excerpt'] ?? mb_substr(strip_tags($article['content']), 0, 160) . '...',
                'content' => $article['content'],
                'category' => $category,
                'categoryAr' => $article['categoryAr'] ?? 'تغذية',
                'author' => $lang === 'ar' ? $author['nameAr'] : $author['name'],
                'authorRole' => $lang === 'ar' ? $author['roleAr'] : $author['role'],
                'authorAvatar' => $author['avatar'],
                'readTime' => $article['readTime'] ?? max(3, (int) ceil(str_word_count(strip_tags($article['content'])) / 200)),
                'tags' => $article['tags'] ?? ['nutrition', 'health'],
                'isFeatured' => !empty($article['isFeatured']) ? true : false,
                'views' => $article['views'] ?? rand(500, 5000),
                'comments' => $article['comments'] ?? rand(0, 50),
                'image' => $images[$category] ?? $images['nutrition'],
                'publishedAt' => Carbon::now()->subDays(rand(1, 30))->toIso8601String(),
                'likes' => $article['likes'] ?? rand(10, 500)
            ];
        }

        // Ensure at least one featured
        if (!collect($result)->contains('isFeatured', true) && count($result) > 0) {
            $result[0]['isFeatured'] = true;
        }

        return $result;
    }

    /**
     * Simple fallback generator: returns deterministic placeholder articles
     * so frontend never receives 500 when OpenAI fails.
     */
    private function fallbackArticles($lang, $category, $limit = 12)
    {
        Log::warning('Using fallbackArticles: OpenAI unavailable or invalid response');

        $templates = [];
        for ($i = 1; $i <= $limit; $i++) {
            $title = $lang === 'ar' ? "مقالة احتياطية رقم {$i}" : "Fallback Article #{$i}";
            $content = $lang === 'ar'
                ? "هذا محتوى افتراضي لاستخراج المقالات في حالة فشل الخدمة الخارجية. الهدف: عرض بنية المقال فقط."
                : "This is fallback content used when external service fails. Purpose: provide article structure only.";

            $templates[] = [
                'id' => (string) Str::uuid(),
                'title' => $title,
                'titleAr' => $title,
                'excerpt' => mb_substr($content, 0, 120) . '...',
                'content' => $content,
                'category' => $category === 'all' ? 'nutrition' : $category,
                'categoryAr' => 'تغذية',
                'author' => $lang === 'ar' ? 'دعم النظام' : 'System',
                'authorRole' => $lang === 'ar' ? 'نظام افتراضي' : 'system',
                'authorAvatar' => 'https://i.pravatar.cc/150?img=1',
                'readTime' => 1,
                'tags' => ['fallback'],
                'isFeatured' => $i === 1,
                'views' => 0,
                'comments' => 0,
                'image' => 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80',
                'publishedAt' => Carbon::now()->toIso8601String(),
                'likes' => 0
            ];
        }

        return $templates;
    }

    private function buildPrompt($lang, $category)
    {
        $categoryFilter = $category !== 'all' ? "Focus on category: {$category}" : '';

        if ($lang === 'ar') {
            return <<<PROMPT
أنشئ مصفوفة JSON تحتوي على مقالات عن التغذية والصحة باللغة العربية. أعد فقط JSON صالح.
مطلوب: مفتاح أعلى-level باسم "articles" وهو مصفوفة من كائنات، كل كائن يحتوي على الحقول:
"title", "titleAr", "excerpt", "content", "category", "categoryAr", "author", "authorRole", "readTime", "tags", "isFeatured", "views", "comments"
{$categoryFilter}
أعد بالضبط 12 عنصرًا إن أمكن، أو على الأقل 6 عناصر إذا لم يكن ذلك ممكنًا.
PROMPT;
        }

        return <<<PROMPT
Return a JSON object with key "articles" : [ ... ] containing articles about nutrition and health in English.
Each article object must include: "title", "titleAr", "excerpt", "content", "category", "categoryAr", "author", "authorRole", "readTime", "tags", "isFeatured", "views", "comments".
{$categoryFilter}
Return EXACTLY JSON (no explanatory text). Try to return 12 articles, but at minimum return 6 usable items if constrained.
PROMPT;
    }

    /**
     * Creates a LengthAwarePaginator from an array.
     */
    private function makePaginator(array $items, $perPage, $page)
    {
        $total = count($items);
        $offset = ($page - 1) * $perPage;
        $slice = array_slice($items, $offset, $perPage);

        return new LengthAwarePaginator($slice, $total, $perPage, $page, [
            'path' => LengthAwarePaginator::resolveCurrentPath(),
        ]);
    }
}
