<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\HomePageController;
use App\Http\Controllers\Api\WhatToCookController;
use App\Http\Controllers\Api\MedicalRecipesController;
use App\Http\Controllers\Api\PopularRecipesController;

Route::prefix('what-to-cook')->group(function () {
    Route::get('/', [WhatToCookController::class, 'index']);
    Route::post('/generate', [WhatToCookController::class, 'generate']);
});

// ====================================
// Trending sections
// ====================================

// Hero trending
Route::get('/home-page', [HomePageController::class, 'index']);
Route::get('/popular-recipes', [PopularRecipesController::class, 'index']);

// ====================================
// What-To-Cook — Chat + Single AI Recipe Generator
// ====================================
Route::post('/what-to-cook', [WhatToCookController::class, 'generate']);


// ====================================
// Medical Recipes (AI powered)
// NOTE: these are API endpoints ONLY
// ====================================
Route::get('/medical-recipes', [MedicalRecipesController::class, 'index']);
Route::post('/medical-recipes/generate', [MedicalRecipesController::class, 'generate']);
Route::get('/medical-recipes', [MedicalRecipesController::class, 'index']);
Route::post('/medical-recipes/generate', [MedicalRecipesController::class, 'generate']);
// ====================================
// Authenticated API (Sanctum)
// ====================================
Route::middleware('auth:sanctum')->group(function () {

    // Get authenticated user info
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
});
// ====================================

Route::prefix('medical-recipes')->group(function () {
    Route::get('/', [MedicalRecipesController::class, 'index']);
    Route::post('/generate', [MedicalRecipesController::class, 'generate']);
    Route::get('/search', [MedicalRecipesController::class, 'search']);
    Route::get('/conditions', [MedicalRecipesController::class, 'getConditions']);
    Route::get('/nutrition-tips', [MedicalRecipesController::class, 'getNutritionTips']);
    Route::post('/chatbot', [MedicalRecipesController::class, 'chatbot']);
});
