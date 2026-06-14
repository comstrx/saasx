<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up () {

        Schema::create('message_actions', function (Blueprint $table) {
            $table->id();
            $table->integer('store_id')->default(0);
            $table->integer('message_id')->default(0);
            $table->integer('user_id')->default(0);
            $table->string('reaction')->nullable();
            $table->boolean('starred')->default(false);
            $table->boolean('pinned')->default(false);
            $table->boolean('deleted')->default(false);
            $table->boolean('read')->default(false);
            $table->boolean('delivered')->default(false);
            $table->boolean('active')->default(true);
            $table->timestamp('read_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

    }

};
