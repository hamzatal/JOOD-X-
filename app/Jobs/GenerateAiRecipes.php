<?php

namespace App\Jobs;

use App\Models\AiRecipe;
use Illuminate\Bus\Queueable;
use Illuminate\Support\Facades\Http;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;

class GenerateAiRecipes implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $lang;
    public $count;

    public function __construct($lang = 'en', $count = 4)
    {
        $this->lang = $lang;
        $this->count = $count;
        $this->queue = 'default';
    }

    public function handle()
    {
        // Use OpenAI: craft a prompt asking for JSON output
        $apiKey = env('OPENAI_API_KEY');
        if (!$apiKey) {
            \Log::error('OPENAI_API_KEY missing for GenerateAiRecipes job');
            return;
        }

        // Build prompt — insist on strict JSON
        $prompt = "Generate {$this->count} unique recipe objects in {$this->lang} as a JSON array.
Each recipe object must have:
- title (short)
- description (1-2 sentences)
- category (one word category: Pasta, Salad, Chicken, Beef, Seafood, Dessert, Vegan)
- prep_time (e.g. '20 minutes')
- ingredients: an array of {name, measure} (max 12)
- steps: an array of step strings (numbered steps)
Return a single valid JSON array only (no extra text).";

        // call OpenAI Chat Completions (gpt-4o-mini or fallback)
        try {
            $res = Http::withHeaders([
                'Authorization' => 'Bearer ' . $apiKey,
                'Content-Type' => 'application/json',
            ])->post('https://api.openai.com/v1/chat/completions', [
                'model' => 'gpt-4o-mini-2024-07-18',
                'messages' => [
                    ['role' => 'system', 'content' => 'You are a helpful assistant that returns strict JSON.'],
                    ['role' => 'user', 'content' => $prompt],
                ],
                'temperature' => 0.8,
                'max_tokens' => 1200,
            ]);

            if (!$res->ok()) {
                \Log::error('OpenAI request failed', ['status' => $res->status(), 'body' => $res->body()]);
                return;
            }

            $body = $res->json();

            // extract assistant content
            $content = $body['choices'][0]['message']['content'] ?? null;
            if (!$content) {
                \Log::error('OpenAI returned no content for recipes');
                return;
            }

            // try decode JSON from content — sometimes it embeds text, attempt to extract JSON substring
            $json = $this->extractJson($content);
            if ($json === null) {
                \Log::error('Could not parse JSON from OpenAI content', ['content' => $content]);
                return;
            }

            // Remove existing recipes for this language (we update)
            AiRecipe::where('lang', $this->lang)->delete();

            $usedImages = [];
            foreach ($json as $obj) {
                // ensure fields exist and normalize
                $title = $obj['title'] ?? ($obj['name'] ?? 'Untitled');
                $desc = $obj['description'] ?? '';
                $cat = $obj['category'] ?? null;
                $time = $obj['prep_time'] ?? ($obj['time'] ?? null);
                $ingredients = $obj['ingredients'] ?? [];
                $steps = $obj['steps'] ?? [];

                // get a unique image from TheMealDB random
                $image = $this->fetchUniqueMealImage($usedImages);

                AiRecipe::create([
                    'title' => $title,
                    'description' => $desc,
                    'ingredients' => $ingredients,
                    'steps' => $steps,
                    'image_url' => $image,
                    'lang' => $this->lang,
                    'category' => $cat,
                    'prep_time' => $time,
                ]);
            }
        } catch (\Exception $e) {
            \Log::error('GenerateAiRecipes job exception', ['err' => $e->getMessage()]);
        }
    }

    private function extractJson($text)
    {
        // find first '[' and last ']' to capture JSON array
        $start = strpos($text, '[');
        $end = strrpos($text, ']');
        if ($start === false || $end === false || $end <= $start) {
            return null;
        }
        $substr = substr($text, $start, $end - $start + 1);
        $decoded = json_decode($substr, true);
        return $decoded;
    }

    private function fetchUniqueMealImage(&$used)
    {
        $tries = 0;
        while ($tries < 10) {
            $tries++;
            $res = Http::get('https://www.themealdb.com/api/json/v1/1/random.php');
            if (!$res->ok()) continue;
            $meal = $res->json()['meals'][0] ?? null;
            $img = $meal['strMealThumb'] ?? null;
            if ($img && !in_array($img, $used)) {
                $used[] = $img;
                return $img;
            }
        }
        // fallback default image
        return url('/images/ai-default.jpg');
    }
}
