<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up () {

        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->integer('store_id')->default(0);
            $table->integer('ref_id')->default(0);
            $table->integer('country_id')->default(0);
            $table->integer('city_id')->default(0);
            $table->integer('category_id')->default(0);
            $table->integer('game_id')->default(0);
            $table->integer('platform_id')->default(0);
            $table->integer('region_id')->default(0);
            $table->json('name')->nullable();
            $table->json('company')->nullable();
            $table->json('location')->nullable();
            $table->enum('type', ['product', 'gift_card'])->default('product');
            $table->string('phone')->nullable();
            $table->string('gender')->nullable();
            $table->string('language')->nullable();
            $table->string('notes')->nullable();
            $table->json('description')->nullable();
            $table->json('details')->nullable();
            $table->json('includes')->nullable();
            $table->json('policy')->nullable();
            $table->json('upgrades')->nullable();
            $table->json('instructions')->nullable();
            $table->decimal('old_price', 10, 2)->default(0);
            $table->decimal('new_price', 10, 2)->default(0);
            $table->decimal('margin_price', 10, 2)->default(0);
            $table->decimal('cancel_cost', 10, 2)->default(0);
            $table->integer('max_quantity')->default(100);
            $table->integer('views')->default(0);
            $table->integer('likes')->default(0);
            $table->integer('dislikes')->default(0);
            $table->timestamp('cancel_before')->nullable();
            $table->timestamp('refund_before')->nullable();
            $table->enum('delivery_method', ['automatic', 'manual', 'pickup', 'delivery'])->default('automatic');
            $table->boolean('active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

    }

};
