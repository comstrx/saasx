<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up () {

        Schema::create('commissions', function ( Blueprint $table ) {
            $table->id();
            $table->integer('store_id')->default(0);
            $table->integer('country_id')->default(0);
            $table->integer('city_id')->default(0);
            $table->integer('category_id')->default(0);
            $table->integer('game_id')->default(0);
            $table->integer('product_id')->default(0);

            $table->enum('role', ['public', 'private', 'vendor', 'delivery', 'client'])->default('client');
            $table->enum('type', ['amount', 'points', 'coupon'])->default('amount');
            $table->integer('coupon_id')->default(0);
            $table->integer('priority')->default(0);

            $table->enum('amount_type', ['fixed', 'percentage'])->default('percentage');
            $table->decimal('amount', 10, 2)->default(0);
            $table->decimal('amount_cap', 10, 2)->default(1000);
            $table->decimal('max_price', 10, 2)->default(100000);
            $table->decimal('min_price', 10, 2)->default(0.01);
            $table->integer('min_orders')->default(0);
            $table->integer('min_level')->default(0);
            $table->json('conditions')->nullable();

            $table->string('name')->nullable();
            $table->string('description')->nullable();
            $table->string('notes')->nullable();

            $table->boolean('active')->default(true);
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

    }

};
