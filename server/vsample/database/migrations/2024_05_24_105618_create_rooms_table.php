<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up () {

        Schema::create('rooms', function (Blueprint $table) {
            $table->id();
            $table->integer('store_id')->default(0);
            $table->integer('creator_id')->default(0);
            $table->enum('type', ['support', 'p2p', 'group'])->default('support');
            $table->string('name')->nullable();
            $table->text('description')->nullable();
            $table->boolean('active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

    }

};
