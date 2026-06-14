<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up () {

        Schema::create('site_infos', function ( Blueprint $table ) {
            $table->id();
            $table->integer('store_id')->default(0);
            $table->string('name')->nullable();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('country')->nullable();
            $table->string('city')->nullable();
            $table->string('street')->nullable();
            $table->string('zip_code')->nullable();
            $table->string('longitude')->nullable();
            $table->string('latitude')->nullable();
            $table->string('language')->nullable();
            $table->string('currency')->nullable();
            $table->string('theme')->nullable();
            $table->string('copyright')->nullable();
            $table->json('socials')->nullable();
            $table->json('partners')->nullable();
            $table->json('downloads')->nullable();
            $table->json('contacts')->nullable();
            $table->boolean('active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

    }

};
