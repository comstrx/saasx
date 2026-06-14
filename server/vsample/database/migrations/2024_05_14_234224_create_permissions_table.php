<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up () {

        Schema::create('permissions', function (Blueprint $table) {
            $table->id();
            $table->integer('store_id')->default(0);
            $table->integer('entity_id')->default(0);
            $table->string('name');
            $table->string('description')->nullable();
            $table->boolean('allow')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['store_id', 'entity_id', 'name']);
        });

    }

};
