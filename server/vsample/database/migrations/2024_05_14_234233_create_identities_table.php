<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up () {

        Schema::create('identities', function (Blueprint $table) {
            $table->id();
            $table->integer('store_id')->default(0);
            $table->integer('user_id')->default(0);
            $table->enum('type', ['passport', 'national_id', 'driver_license']);
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->string('country')->nullable();
            $table->string('city')->nullable();
            $table->string('name')->nullable();
            $table->string('number')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('rejected_at')->nullable();
            $table->boolean('active')->default(false);
            $table->timestamps();
            $table->softDeletes();
        });

    }

};
