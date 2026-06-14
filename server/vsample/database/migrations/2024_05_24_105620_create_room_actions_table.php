<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up () {

        Schema::create('room_actions', function (Blueprint $table) {
            $table->id();
            $table->integer('store_id')->default(0);
            $table->integer('room_id')->default(0);
            $table->integer('user_id')->default(0);
            $table->boolean('archived')->default(false);
            $table->boolean('deleted')->default(false);
            $table->boolean('muted')->default(false);
            $table->boolean('pinned')->default(false);
            $table->boolean('active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

    }

};
