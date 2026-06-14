<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up () {

        Schema::create('entities', function (Blueprint $table) {
            $table->id();
            $table->integer('store_id')->default(0);
            $table->string('name');
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['store_id', 'name']);
        });

    }

};
