<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up () {

        Schema::create('domains', function (Blueprint $table) {
            $table->id();
            $table->integer('store_id')->default(0);
            $table->integer('zone_id')->default(0);
            $table->string('provider_id')->nullable();
            $table->string('name');
            $table->enum('dest', ['client', 'admin', 'vendor', 'delivery', 'affiliate', 'blog', 'app', 'api', 'cdn'])->default('client');
            $table->enum('status', ['pending', 'verified', 'failed'])->default('verified');
            $table->boolean('active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['zone_id', 'name', 'deleted_at']);
        });

    }

};
