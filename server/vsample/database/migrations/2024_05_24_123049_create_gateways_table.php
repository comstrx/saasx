<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up () {

        Schema::create('gateways', function (Blueprint $table) {
            $table->id();
            $table->integer('store_id')->default(0);
            $table->string('name');
            $table->enum('type', ['visa', 'wallet', 'crypto', 'bank'])->default('visa');
            $table->decimal('min_deposit_value', 15, 2)->default(0);
            $table->decimal('max_deposit_value', 15, 2)->default(0);
            $table->decimal('min_withdraw_value', 15, 2)->default(0);
            $table->decimal('max_withdraw_value', 15, 2)->default(0);
            $table->decimal('deposit_tax_value', 15, 2)->default(0);
            $table->decimal('withdraw_tax_value', 15, 2)->default(0);
            $table->decimal('deposit_tax_rate', 5, 2)->default(0);
            $table->decimal('withdraw_tax_rate', 5, 2)->default(0);
            $table->integer('refund_days')->default(0);
            $table->string('language')->nullable();
            $table->string('currency')->nullable();
            $table->string('country')->nullable();
            $table->json('credentials')->nullable();
            $table->json('webhooks')->nullable();
            $table->text('description')->nullable();
            $table->text('notes')->nullable();
            $table->boolean('allow_deposit')->default(true);
            $table->boolean('allow_withdraw')->default(true);
            $table->boolean('allow_refund')->default(true);
            $table->boolean('allow_pay')->default(true);
            $table->boolean('sandbox')->default(false);
            $table->boolean('active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['store_id', 'name', 'deleted_at']);
        });

    }

};
