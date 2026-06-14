<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up () {

        Schema::create('levels', function ( Blueprint $table ) {
            $table->id();
            $table->integer('store_id')->default(0);

            $table->integer('rank')->default(0);
            $table->string('color')->nullable();
            $table->enum('type', ['public', 'private'])->default('public');

            $table->enum('cashback_type', ['fixed', 'percentage'])->default('percentage');
            $table->decimal('cashback', 10, 2)->default(0);
            $table->decimal('max_cashback', 10, 2)->default(1000);

            $table->integer('min_points')->default(0);
            $table->integer('min_orders')->default(0);
            $table->integer('min_deposits')->default(0);
            $table->integer('min_referrals')->default(0);
            $table->json('conditions')->nullable();

            $table->json('name')->nullable();
            $table->json('description')->nullable();
            $table->string('notes')->nullable();

            $table->boolean('active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['store_id', 'rank', 'deleted_at']);
        });

    }

};
