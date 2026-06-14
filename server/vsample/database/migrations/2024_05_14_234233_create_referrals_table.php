<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up () {

        Schema::create('referrals', function (Blueprint $table) {
            $table->id();
            $table->integer('store_id')->default(0);
            $table->integer('referrer_id')->default(0);
            $table->integer('referred_id')->default(0);
            $table->boolean('deleted')->default(false);
            $table->boolean('active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

    }

};
