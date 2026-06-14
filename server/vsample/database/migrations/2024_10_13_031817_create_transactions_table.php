<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up () {

        Schema::create('transactions', function ( Blueprint $table ) {
            $table->id();
            $table->integer('store_id')->default(0);
            $table->integer('withdraw_method_id')->default(0);
            $table->integer('transaction_id')->default(0);
            $table->integer('wallet_id')->default(0);
            $table->integer('order_id')->default(0);
            $table->string('reference')->unique();
            $table->string('payment')->nullable();
            $table->string('currency')->default('USD');
            $table->string('paid_currency')->default('USD');
            $table->decimal('amount', 15, 2)->default(0);
            $table->decimal('tax_amount', 15, 2)->default(0);
            $table->decimal('paid_amount', 15, 2)->default(0);
            $table->decimal('released_amount', 15, 2)->default(0);
            $table->decimal('exchange_amount', 15, 2)->default(0);
            $table->decimal('exchange_rate', 15, 2)->default(0);
            $table->integer('refund_days')->default(0);
            $table->text('description')->nullable();
            $table->text('notes')->nullable();
            $table->json('recipient')->nullable();
            $table->boolean('allow_refund')->default(true);
            $table->boolean('deleted')->default(false);
            $table->boolean('active')->default(true);
            $table->enum('type', ['deposit', 'withdraw', 'pay', 'refund', 'transfer'])->default('deposit');
            $table->enum('status', ['pending', 'successful', 'failed', 'refunded', 'cancelled'])->default('pending');
            $table->timestamps();
            $table->softDeletes();
        });

    }

};
