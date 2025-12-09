<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;



// ==============================
// KIDS MEALS - Kid-Friendly Recipes
// ==============================
Route::get('/kids-meals', function () {
    return Inertia::render('KidsMealsPage');
})->name('kids-meals');


// ==============================
// Meal Planner page (Inertia)
// ==============================
Route::get('/meal-planner', function () {
    return Inertia::render('MealPlannerPage');
});

// ==============================
// Home page
// ==============================
Route::get('/', function () {
    return Inertia::render('HomePage', [
        'canLogin'      => Route::has('login'),
        'canRegister'   => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion'    => PHP_VERSION,
    ]);
})->name('home');

// ==============================
// What to cook page (Inertia)
// ==============================
Route::get('/what-to-cook', function () {
    return Inertia::render('WhatToCookPage');
})->name('what-to-cook');

// ==============================
// Recipes page (Inertia)
// ==============================
Route::get('/recipes', function () {
    return Inertia::render('RecipesPage');
})->name('recipes');


// ==============================
// Medical recipes page (Inertia)
// * ONLY page → NO JSON here
// ==============================
Route::get('/medical-recipes', function () {
    return Inertia::render('MedicalRecipesPage');
})->name('medical-recipes');


// ==============================
// Authenticated pages
// ==============================
Route::middleware(['auth', 'verified'])->group(function () {

    // Dashboard
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard');
    })->name('dashboard');
});

// ==============================
// Profile
// ==============================
Route::middleware('auth')->prefix('profile')->name('profile.')->group(function () {

    Route::get('/',    [ProfileController::class, 'edit'])->name('edit');
    Route::patch('/',  [ProfileController::class, 'update'])->name('update');
    Route::delete('/', [ProfileController::class, 'destroy'])->name('destroy');
});

require __DIR__ . '/auth.php';
