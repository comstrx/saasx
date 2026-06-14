<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up () {

        Schema::create('countries', function (Blueprint $table) {
            $table->id();
            $table->integer('store_id')->default(0);
            $table->integer('ref_id')->default(0);
            $table->json('name')->nullable();
            $table->json('description')->nullable();
            $table->string('iso')->nullable();
            $table->string('code')->nullable();
            $table->string('notes')->nullable();
            $table->integer('views')->default(0);
            $table->integer('likes')->default(0);
            $table->integer('dislikes')->default(0);
            $table->boolean('active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

    }

};
