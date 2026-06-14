<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up () {

        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->integer('store_id')->default(0);
            $table->integer('room_id')->default(0);
            $table->integer('replied_id')->default(0);
            $table->integer('product_id')->default(0);
            $table->integer('sender_id')->default(0);
            $table->string('type')->default('text');
            $table->longText('content')->nullable();
            $table->json('history')->nullable();
            $table->boolean('active')->default(true);
            $table->boolean('edited')->default(false);
            $table->timestamp('edited_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

    }

};
