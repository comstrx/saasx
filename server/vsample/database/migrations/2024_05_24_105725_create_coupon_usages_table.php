<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up () {

        Schema::create('coupon_usages', function ( Blueprint $table ) {
            $table->id();
            $table->integer('store_id')->default(0);
            $table->integer('coupon_id')->default(0);
            $table->integer('user_id')->default(0);
            $table->string('code')->nullable();
            $table->decimal('discount', 10, 2)->default(0);
            $table->json('snapshot')->nullable();
            $table->boolean('active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

    }

};
