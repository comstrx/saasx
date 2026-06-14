<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up () {

        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->integer('store_id')->default(0);
            $table->integer('ref_id')->default(0);
            $table->integer('product_id')->default(0);
            $table->integer('coupon_id')->default(0);
            $table->integer('user_id')->default(0);
            $table->integer('platform_id')->default(0);
            $table->integer('region_id')->default(0);
            $table->integer('gift_code_id')->default(0);
            $table->string('player_id')->nullable();
            $table->string('pay_type')->nullable();
            $table->string('name')->nullable();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('language')->nullable();
            $table->string('country')->nullable();
            $table->string('state')->nullable();
            $table->string('city')->nullable();
            $table->string('zip_code')->nullable();
            $table->string('address')->nullable();
            $table->string('ip')->nullable();
            $table->string('agent')->nullable();
            $table->string('notes')->nullable();
            $table->json('upgrades')->nullable();
            $table->text('cancel_notes')->nullable();
            $table->integer('quantity')->default(1);
            $table->integer('views')->default(0);
            $table->string('delivery_method')->nullable();
            $table->string('secret_key')->nullable();
            $table->string('coupon_code')->nullable();
            $table->decimal('discount', 12, 2)->default(0);
            $table->decimal('amount', 12, 2)->default(0);
            $table->decimal('paid_amount', 12, 2)->default(0);
            $table->decimal('refunded_amount', 12, 2)->default(0);
            $table->decimal('cancel_cost', 12, 2)->default(0);
            $table->decimal('supplier_earning', 10, 2)->default(0);
            $table->decimal('net_profit', 10, 2)->default(0);
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamp('refunded_at')->nullable();
            $table->timestamp('cancel_before')->nullable();
            $table->timestamp('refund_before')->nullable();
            $table->boolean('allow_cancel')->default(false);
            $table->boolean('allow_refund')->default(false);
            $table->boolean('allow_pay_later')->default(false);
            $table->boolean('refunded')->default(false);
            $table->boolean('deleted')->default(false);
            $table->boolean('paid')->default(false);
            $table->enum('status', ['pending', 'confirmed', 'completed', 'cancelled'])->default('pending');
            $table->boolean('processing')->default(false);
            $table->boolean('active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['store_id', 'secret_key']);
        });

    }

};
