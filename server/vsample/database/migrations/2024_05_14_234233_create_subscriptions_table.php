<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up () {

        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->integer('plan_id')->default(0);
            $table->integer('store_id')->default(0);
            $table->enum('type', ['store'])->default('store');
            $table->string('duration')->nullable();
            $table->integer('trial_days')->default(0);
            $table->decimal('price', 10, 2)->default(0);
            $table->boolean('auto_renew')->default(true);
            $table->boolean('active')->default(true);
            $table->timestamp('started_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

    }

};
