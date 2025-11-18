<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AiRecipe;
use Illuminate\Http\JsonResponse;

class AiRecipeController extends Controller
{
    /**
     * GET /api/ai-recipes
     * Return the latest 4 AI recipes and the last update timestamp.
     */
    public function index(): JsonResponse
    {
        // latest 4 by created_at
        $recipes = AiRecipe::orderBy('updated_at', 'desc')->limit(4)->get();

        return response()->json([
            'updated_at' => $recipes->first() ? $recipes->first()->updated_at : null,
            'recipes' => $recipes->map(function ($r) {
                return [
                    'id' => $r->id,
                    'title' => $r->title,
                    'desc' => $r->description,
                    'image' => $r->image_url,
                    'time' => $r->prep_time,
                    'ingredients' => $r->ingredients,
                ];
            })->values(),
        ]);
    }
}
