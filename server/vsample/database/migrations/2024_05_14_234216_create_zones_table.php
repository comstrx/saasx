<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up () {

        Schema::create('zones', function (Blueprint $table) {
            $table->id();
            $table->integer('store_id')->default(0);
            $table->string('provider_id')->nullable();
            $table->string('name');
            $table->string('ns1')->nullable();
            $table->string('ns2')->nullable();
            $table->enum('type', ['internal', 'external'])->default('internal');
            $table->enum('status', ['pending', 'verified', 'failed'])->default('verified');
            $table->boolean('active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['name', 'deleted_at']);
        });

    }

};
