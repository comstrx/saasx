<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up () {

        Schema::create('verifications', function (Blueprint $table) {
            $table->id();
            $table->integer('store_id')->default(0);
            $table->integer('user_id')->default(0);
            $table->string('type')->nullable();
            $table->string('code')->nullable();
            $table->string('ip')->nullable();
            $table->string('agent')->nullable();
            $table->integer('attempts')->default(0);
            $table->boolean('verified')->default(false);
            $table->boolean('active')->default(true);
            $table->enum('over', ['email', 'sms', 'whatsapp']);
            $table->timestamp('verified_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

    }

};
