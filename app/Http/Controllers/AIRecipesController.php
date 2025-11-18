<?php

namespace App\Http\Controllers;

use App\Models\AIRecipe;

class AIRecipesController extends Controller
{
    public function index()
    {
        return AIRecipe::latest()->take(4)->get();
    }
}
