<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up () {

        Schema::create('wallets', function (Blueprint $table) {
            $table->id();
            $table->integer('store_id')->default(0);
            $table->integer('user_id')->default(0);
            $table->decimal('pending_balance', 10, 2)->default(0);
            $table->decimal('buy_balance', 10, 2)->default(0);
            $table->decimal('withdraw_balance', 10, 2)->default(0);
            $table->decimal('fee_balance', 10, 2)->default(0);
            $table->decimal('total_withdraws', 10, 2)->default(0);
            $table->decimal('total_deposits', 10, 2)->default(0);
            $table->decimal('total_transfers', 10, 2)->default(0);
            $table->decimal('total_refunds', 10, 2)->default(0);
            $table->decimal('total_cashback', 10, 2)->default(0);
            $table->decimal('total_pays', 10, 2)->default(0);
            $table->decimal('referral_earnings', 10, 2)->default(0);
            $table->integer('earned_points')->default(0);
            $table->integer('points')->default(0);
            $table->boolean('processing')->default(false);
            $table->boolean('active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

    }

};
