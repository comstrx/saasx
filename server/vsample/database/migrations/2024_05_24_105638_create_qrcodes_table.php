<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up () {

        Schema::create('qrcodes', function ( Blueprint $table ) {
            $table->id();
            $table->integer('store_id')->default(0);
            $table->morphs('related');
            $table->string('name')->nullable();
            $table->string('content')->nullable();
            $table->string('path')->nullable();
            $table->boolean('active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

    }

};
