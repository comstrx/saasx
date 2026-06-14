<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up () {

        Schema::create('games', function (Blueprint $table) {
            $table->id();
            $table->integer('store_id')->default(0);
            $table->integer('ref_id')->default(0);
            $table->integer('country_id')->default(0);
            $table->integer('city_id')->default(0);
            $table->integer('category_id')->default(0);
            $table->json('name')->nullable();
            $table->json('company')->nullable();
            $table->json('location')->nullable();
            $table->string('type')->default('game');
            $table->string('language')->nullable();
            $table->string('phone')->nullable();
            $table->string('gender')->nullable();
            $table->string('notes')->nullable();
            $table->json('description')->nullable();
            $table->json('details')->nullable();
            $table->json('includes')->nullable();
            $table->json('policy')->nullable();
            $table->json('instructions')->nullable();
            $table->json('fields')->nullable();
            $table->integer('views')->default(0);
            $table->integer('likes')->default(0);
            $table->integer('dislikes')->default(0);
            $table->boolean('active')->default(true);
            $table->enum('delivery_method', ['automatic', 'manual', 'pickup', 'delivery'])->default('automatic');
            $table->timestamps();
            $table->softDeletes();
        });

    }

};
