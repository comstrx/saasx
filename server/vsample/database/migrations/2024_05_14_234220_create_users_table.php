<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up () {

        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->integer('store_id')->default(0);
            $table->integer('admin_id')->default(0);

            $table->enum('role', ['admin', 'vendor', 'client'])->default('client');
            $table->integer('level')->default(0);
            $table->string('name')->nullable();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('password')->nullable();

            $table->string('country')->nullable();
            $table->string('city')->nullable();
            $table->string('street')->nullable();
            $table->string('state')->nullable();
            $table->string('zip_code')->nullable();
            $table->string('address')->nullable();
            $table->string('gender')->nullable();
            $table->string('language')->nullable();
            $table->string('currency')->nullable();
            $table->string('theme')->nullable();
            $table->string('ip')->nullable();
            $table->string('agent')->nullable();
            $table->string('notes')->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->decimal('latitude', 10, 7)->nullable();

            $table->boolean('email_verified')->default(false);
            $table->boolean('phone_verified')->default(false);
            $table->boolean('identity_verified')->default(false);
            $table->boolean('active')->default(true);
            
            $table->date('birth_date')->nullable();
            $table->timestamp('login_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['store_id', 'email', 'deleted_at']);
        });

    }

};
