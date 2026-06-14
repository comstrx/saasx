<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up () {

        Schema::create('plans', function (Blueprint $table) {
            $table->id();
            
            $table->decimal('monthly_old_price', 10, 2)->default(0);
            $table->decimal('yearly_old_price', 10, 2)->default(0);
            $table->decimal('lifetime_old_price', 10, 2)->default(0);

            $table->decimal('monthly_new_price', 10, 2)->default(0);
            $table->decimal('yearly_new_price', 10, 2)->default(0);
            $table->decimal('lifetime_new_price', 10, 2)->default(0);

            $table->integer('monthly_trial_days')->default(0);
            $table->integer('yearly_trial_days')->default(0);
            $table->integer('lifetime_trial_days')->default(0);

            $table->json('name')->nullable();
            $table->json('description')->nullable();
            $table->json('features')->nullable();
            $table->text('notes')->nullable();
            $table->string('currency')->default('USD');
            $table->decimal('max_subscriptions', 10, 2)->default(1000);

            $table->boolean('free')->default(false);
            $table->boolean('recommended')->default(false);
            $table->boolean('popular')->default(false);
            $table->boolean('basic')->default(false);
            $table->boolean('premium')->default(false);
            $table->boolean('active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

    }

};
