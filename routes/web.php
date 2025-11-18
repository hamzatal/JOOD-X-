<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Api\AiRecipeController;
use App\Http\Controllers\TrendingRecipesController;
use App\Http\Controllers\MealDBProxyController;
use App\Http\Controllers\AIRecipesController;



Route::get('/trending-recipes', [TrendingRecipesController::class, 'index']);
Route::get('/mealdb/{endpoint}', [MealDBProxyController::class, 'proxy']);
Route::get('/ai-recipes', [AIRecipesController::class, 'index']);

Route::get('/', function () {
    return Inertia::render('HomePage', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::get('/ai-recipes', [AiRecipeController::class, 'index']);

require __DIR__ . '/auth.php';
