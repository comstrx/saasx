<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up () {

        Schema::create('comments', function ( Blueprint $table ) {
            $table->id();
            $table->integer('store_id')->default(0);
            $table->integer('user_id')->default(0);
            $table->integer('ref_id')->default(0);
            $table->morphs('related');

            $table->string('title')->nullable();
            $table->longText('content')->nullable();

            $table->string('ip')->nullable();
            $table->string('agent')->nullable();
            $table->integer('views')->default(0);
            $table->integer('likes')->default(0);
            $table->integer('dislikes')->default(0);
            $table->boolean('deleted')->default(false);
            $table->boolean('active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

    }

};
