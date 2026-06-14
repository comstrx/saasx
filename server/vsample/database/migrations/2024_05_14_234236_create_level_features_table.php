<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up () {

        Schema::create('level_features', function ( Blueprint $table ) {
            $table->id();
            $table->integer('store_id')->default(0);
            $table->integer('level_id')->default(0);
            $table->json('name')->nullable();
            $table->json('description')->nullable();
            $table->json('benefits')->nullable();
            $table->string('notes')->nullable();
            $table->boolean('active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

    }

};
