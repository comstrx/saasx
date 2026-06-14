<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up () {

        Schema::create('files', function (Blueprint $table) {
            $table->id();
            $table->integer('store_id')->default(0);
            $table->string('system')->nullable();
            $table->integer('column')->default(0);
            $table->enum('type', ['image', 'audio', 'video', 'file']);
            $table->string('name')->nullable();
            $table->string('size')->nullable();
            $table->string('url')->nullable();
            $table->boolean('active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

    }

};
