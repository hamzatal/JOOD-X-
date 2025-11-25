<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\AiRecipesController;
use App\Http\Controllers\Api\HeroTrendController;
use App\Http\Controllers\Api\TrendingRecipesController;
use App\Http\Controllers\Api\WhatToCookController;
use App\Http\Controllers\Api\MedicalRecipesController;
use App\Http\Controllers\Api\HealthAssistantController;

// ====================================
// Trending sections
// ====================================

// Hero trending
Route::get('/hero-trending', [HeroTrendController::class, 'index']);

// Spoonacular trending recipes
Route::get('/trending-recipes', [TrendingRecipesController::class, 'index']);


// ====================================
// AI Recipes Grid
// (Daily auto + manual generate)
// ====================================
Route::get('/ai-recipes',        [AiRecipesController::class, 'index']);
Route::post('/ai-recipes/generate', [AiRecipesController::class, 'generate']);


// ====================================
// What-To-Cook — Chat + Single AI Recipe Generator
// ====================================
Route::post('/what-to-cook', [WhatToCookController::class, 'handle']);


// ====================================
// Medical Recipes (AI powered)
// NOTE: these are API endpoints ONLY
// ====================================
Route::get('/medical-recipes', [MedicalRecipesController::class, 'index']);
Route::post('/medical-recipes/generate', [MedicalRecipesController::class, 'generate']);
Route::get('/medical-recipes', [MedicalRecipesController::class, 'index']);               // returns cached daily recipes (or empty)
Route::post('/medical-recipes/generate', [MedicalRecipesController::class, 'generate']); // generate new medical recipes (accepts lang, condition, constraints)


// ====================================
// Health Assistant AI Chat
// ====================================
Route::post('/health-assistant', [HealthAssistantController::class, 'handle']);


// ====================================
// Authenticated API (Sanctum)
// ====================================
Route::middleware('auth:sanctum')->group(function () {

    // Get authenticated user info
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
});
