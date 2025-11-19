<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateAiRecipesTable extends Migration
{
    public function up()
    {
        Schema::create('ai_recipes', function (Blueprint $table) {
            $table->id();
            $table->string('title')->index();
            $table->text('description')->nullable();
            $table->json('ingredients')->nullable(); // array of {name, measure}
            $table->json('steps')->nullable(); // array of steps
            $table->string('image_url')->nullable();
            $table->string('lang', 5)->default('en')->index();
            $table->string('category')->nullable()->index();
            $table->string('prep_time')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('ai_recipes');
    }
}
