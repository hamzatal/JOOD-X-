<?php

namespace App\Jobs;

use App\Models\AiRecipe;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Support\Facades\Http;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Str;
use Exception;

class GenerateAiRecipesJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    // number of recipes to generate
    public int $count;

    public function __construct(int $count = 4)
    {
        $this->count = $count;
    }

    public function handle(): void
    {
        // Attempt OpenAI generation first (if key present)
        $openAiKey = config('services.openai.key') ?: env('OPENAI_API_KEY');

        if ($openAiKey) {
            try {
                $recipes = $this->generateFromOpenAI($openAiKey, $this->count);
                if ($recipes && count($recipes) > 0) {
                    $this->storeRecipes($recipes);
                    return;
                }
            } catch (Exception $e) {
                // Log and fallback
                logger()->error('OpenAI generation failed: ' . $e->getMessage());
            }
        }

        // Fallback: use TheMealDB randoms
        try {
            $recipes = $this->generateFromTheMealDB($this->count);
            if ($recipes && count($recipes) > 0) {
                $this->storeRecipes($recipes);
                return;
            }
        } catch (Exception $e) {
            logger()->error('TheMealDB fallback failed: ' . $e->getMessage());
        }
    }

    protected function generateFromOpenAI(string $key, int $count): array
    {
        // Build a prompt that instructs the model to return JSON array of recipes.
        // Each recipe object should include: title, description, ingredients (array), image_url (optional), prep_time
        $model = env('OPENAI_API_MODEL', 'gpt-4o-mini'); // change if you prefer
        $prompt = "You are a culinary assistant. Generate {$count} original, practical, and easy-to-follow recipes in JSON format. " .
            "The output must be a JSON array of objects. Each object MUST have these keys: title, description, ingredients (array of strings), image_url (url string or empty), prep_time (e.g. '20 min'). " .
            "Do not include any extra commentary — output pure JSON only. Ensure ingredients are realistic and preparation is short (under 60 minutes). Provide diverse meals (not all same type).";

        // Use Chat Completions endpoint (OpenAI) — adapt if your API requires different path
        $response = Http::withHeaders([
            'Authorization' => "Bearer {$key}",
            'Content-Type' => 'application/json',
        ])->post('https://api.openai.com/v1/chat/completions', [
            'model' => $model,
            'messages' => [
                ['role' => 'system', 'content' => 'You are a helpful expert chef who outputs strict JSON.'],
                ['role' => 'user', 'content' => $prompt],
            ],
            'temperature' => 0.8,
            'max_tokens' => 900,
        ]);

        if (!$response->successful()) {
            throw new Exception('OpenAI API error: ' . $response->body());
        }

        $body = $response->json();
        // Get text response from chat choices
        $text = $body['choices'][0]['message']['content'] ?? null;
        if (!$text) {
            throw new Exception('OpenAI returned no content.');
        }

        // Try to extract JSON from the response robustly
        $json = $this->extractJson($text);
        if (!$json) {
            // try to parse loose JSON
            $decoded = json_decode($text, true);
            if (is_array($decoded)) {
                $json = $decoded;
            } else {
                throw new Exception('Failed to parse OpenAI JSON response.');
            }
        }

        // sanitize and normalize
        $recipes = [];
        foreach ($json as $item) {
            if (!is_array($item)) continue;
            $recipes[] = [
                'title' => trim($item['title'] ?? (string) Str::limit($item['description'] ?? 'Untitled', 60)),
                'description' => $item['description'] ?? '',
                'ingredients' => array_values($item['ingredients'] ?? []),
                'image_url' => $item['image_url'] ?? '',
                'prep_time' => $item['prep_time'] ?? '',
            ];
        }

        return $recipes;
    }

    protected function generateFromTheMealDB(int $count): array
    {
        $base = env('THEMEALDB_BASE', 'https://www.themealdb.com/api/json/v1/1');

        $recipes = [];
        for ($i = 0; $i < $count; $i++) {
            $res = Http::get("{$base}/random.php");
            if (!$res->successful()) continue;
            $meal = $res->json('meals.0');
            if (!$meal) continue;

            // build ingredients array from strIngredientX / strMeasureX
            $ingredients = [];
            for ($k = 1; $k <= 20; $k++) {
                $ing = trim($meal["strIngredient{$k}"] ?? '');
                $meas = trim($meal["strMeasure{$k}"] ?? '');
                if ($ing) {
                    $ingredients[] = trim(($meas ? ($meas . ' ') : '') . $ing);
                }
            }

            $recipes[] = [
                'title' => $meal['strMeal'] ?? 'Untitled',
                'description' => $meal['strInstructions'] ? substr($meal['strInstructions'], 0, 300) : '',
                'ingredients' => $ingredients,
                'image_url' => $meal['strMealThumb'] ?? '',
                'prep_time' => '', // not provided by API
            ];
        }

        return $recipes;
    }

    protected function storeRecipes(array $recipes): void
    {
        // Clear old ones or keep history depending on preference.
        // Here we keep history but only keep latest N records (optional).
        // We'll simply upsert by unique title to avoid duplicates (simple approach).
        foreach ($recipes as $r) {
            AiRecipe::updateOrCreate(
                ['title' => $r['title']],
                [
                    'description' => $r['description'] ?? '',
                    'ingredients' => $r['ingredients'] ?? [],
                    'image_url' => $r['image_url'] ?? '',
                    'prep_time' => $r['prep_time'] ?? '',
                ]
            );
        }

        // Optionally prune to keep the table small: keep latest 100 entries
        $max = 200;
        $count = AiRecipe::count();
        if ($count > $max) {
            $toDelete = AiRecipe::orderBy('created_at', 'asc')->limit($count - $max)->pluck('id')->toArray();
            AiRecipe::destroy($toDelete);
        }
    }

    /**
     * Try to extract JSON array from a free text reply.
     */
    protected function extractJson(string $text): ?array
    {
        // find first [ and last ] and attempt to decode substring
        $start = strpos($text, '[');
        $end = strrpos($text, ']');
        if ($start === false || $end === false || $end <= $start) {
            return null;
        }
        $substr = substr($text, $start, $end - $start + 1);

        $decoded = json_decode($substr, true);
        return is_array($decoded) ? $decoded : null;
    }
    protected function schedule(Schedule $schedule)
    {
        // run every 3 days at 03:00
        $schedule->job(new \App\Jobs\GenerateAiRecipesJob(4))->cron('0 3 */3 * *');
        // other schedule entries...
    }
}
