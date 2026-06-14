<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up () {

        Schema::create('withdraw_methods', function ( Blueprint $table ) {
            $table->id();
            $table->integer('store_id')->default(0);
            $table->string('code');
            $table->string('currency')->nullable();
            $table->decimal('min_amount', 15, 2)->default(0);
            $table->decimal('max_amount', 15, 2)->default(0);
            $table->decimal('tax_value', 15, 2)->default(0);
            $table->decimal('tax_rate', 15, 2)->default(0);
            $table->json('name')->nullable();
            $table->json('fields')->nullable();
            $table->json('description')->nullable();
            $table->text('notes')->nullable();
            $table->boolean('active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['store_id', 'code', 'deleted_at']);
        });

    }

};
