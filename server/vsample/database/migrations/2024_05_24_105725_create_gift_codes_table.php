<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up () {

        Schema::create('gift_codes', function ( Blueprint $table ) {
            $table->id();
            $table->integer('store_id')->default(0);
            $table->integer('ref_id')->default(0);
            $table->integer('game_id')->default(0);
            $table->integer('product_id')->default(0);
            $table->integer('user_id')->default(0);
            $table->enum('type', ['public', 'private'])->default('public');
            $table->string('code')->nullable();
            $table->text('description')->nullable();
            $table->text('notes')->nullable();
            $table->boolean('active')->default(true);
            $table->timestamp('used_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['store_id', 'code', 'deleted_at']);
        });

    }

};
