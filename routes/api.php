<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AiRecipesController;
use App\Http\Controllers\Api\HeroTrendController;
use App\Http\Controllers\Api\TrendingRecipesController;
use App\Http\Controllers\Api\WhatToCookController;

Route::get('/hero-trending', [HeroTrendController::class, 'index']);
Route::get('/trending-recipes', [TrendingRecipesController::class, 'index']);

// ==========================
Route::middleware('auth:sanctum')->group(function () {

    Route::get('/user', function (Request $request) {
        return $request->user();
    });
});
// AI recipes grid (cached daily)
Route::get('/ai-recipes', [AiRecipesController::class, 'index']);
Route::post('/ai-recipes/generate', [AiRecipesController::class, 'generate']);

// Chat / what-to-cook endpoint
Route::post('/what-to-cook', [WhatToCookController::class, 'handle']);