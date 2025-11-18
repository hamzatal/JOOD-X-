<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\TrendingRecipesController;
use App\Http\Controllers\AIRecipesController;
use App\Http\Controllers\HeroTrendController;

Route::get('/hero-trending', [HeroTrendController::class, 'index']);

Route::get('/trending-recipes', [TrendingRecipesController::class, 'index']);
Route::get('/ai-recipes', [AIRecipesController::class, 'index']);

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});
