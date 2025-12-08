<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\HomePageController;
use App\Http\Controllers\Api\WhatToCookController;
use App\Http\Controllers\Api\MedicalRecipesController;
use App\Http\Controllers\Api\RandomRecipesController;
use App\Http\Controllers\Api\RecipeController;
use App\Http\Controllers\Api\MealPlannerController;


/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application.
|
*/


// ============================================================================
// MEAL PLANNER - AI Powered Weekly Meal Plans
// ============================================================================

Route::get('/meal-planner', [MealPlannerController::class, 'generate']);
Route::get('/meal-planner/generate', [\App\Http\Controllers\Api\MealPlannerController::class, 'generate']);

// ============================================================================
// HOME & TRENDING RECIPES
// ============================================================================

Route::prefix('home-page')->group(function () {
    Route::get('/', [HomePageController::class, 'getTrendingRecipes']);
    Route::get('/trending', [HomePageController::class, 'getTrendingRecipes']);
});

// ============================================================================
// RANDOM RECIPES
// ============================================================================
Route::get('/random-recipes', [RandomRecipesController::class, 'index']);
Route::post('/random-recipes/cache/clear', [RandomRecipesController::class, 'clearCache']);


// ============================================================================
// RECIPES - General Recipe Endpoints
// ============================================================================
Route::get('/recipes', [RecipeController::class, 'index']);
Route::get('/recipes/category/{category}', [RecipeController::class, 'byCategory']);
Route::get('/recipes/search', [RecipeController::class, 'search']);

// ============================================================================
// WHAT TO COOK - AI Recipe Generator & Chat
// ============================================================================

Route::prefix('what-to-cook')->group(function () {
    Route::get('/', [WhatToCookController::class, 'index']);
    Route::post('/generate', [WhatToCookController::class, 'generate']);
});

Route::post('/what-to-cook', [WhatToCookController::class, 'generate']);

// ============================================================================
// MEDICAL RECIPES - AI Powered Health-Based Recipes
// ============================================================================

Route::prefix('medical-recipes')->group(function () {
    Route::get('/', [MedicalRecipesController::class, 'index']);
    Route::post('/generate', [MedicalRecipesController::class, 'generate']);
    Route::get('/search', [MedicalRecipesController::class, 'search']);
    Route::get('/conditions', [MedicalRecipesController::class, 'getConditions']);
    Route::get('/nutrition-tips', [MedicalRecipesController::class, 'getNutritionTips']);
    Route::post('/chatbot', [MedicalRecipesController::class, 'chatbot']);
});

// ============================================================================
// AUTHENTICATED ROUTES - Sanctum Protected
// ============================================================================

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
});
