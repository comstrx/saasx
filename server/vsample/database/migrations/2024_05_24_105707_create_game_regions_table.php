<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up () {

        Schema::create('game_regions', function (Blueprint $table) {
            $table->id();
            $table->integer('store_id')->default(0);
            $table->integer('region_id')->default(0);
            $table->integer('game_id')->default(0);
            $table->boolean('active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

    }

};
