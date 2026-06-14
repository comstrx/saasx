<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up () {

        Schema::create('withdraw_transactions', function ( Blueprint $table ) {
            $table->id();
            $table->integer('store_id')->default(0);
            $table->integer('withdraw_method_id')->default(0);
            $table->integer('user_id')->default(0);
            $table->decimal('tax_rate', 15, 2)->default(0);
            $table->decimal('tax_value', 15, 2)->default(0);
            $table->decimal('tax_amount', 15, 2)->default(0);
            $table->decimal('amount', 15, 2)->default(0);
            $table->string('currency')->nullable();
            $table->text('description')->nullable();
            $table->text('notes')->nullable();
            $table->json('recipient')->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->boolean('deleted')->default(false);
            $table->boolean('active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

    }

};
