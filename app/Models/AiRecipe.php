<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AiRecipe extends Model
{
    protected $fillable = [
        'title',
        'description',
        'ingredients',
        'steps',
        'image_url',
        'lang',
        'category',
        'prep_time',
    ];

    protected $casts = [
        'ingredients' => 'array',
        'steps' => 'array',
    ];
}
