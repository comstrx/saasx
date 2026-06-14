<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up () {

        Schema::create('commission_users', function ( Blueprint $table ) {
            $table->id();
            $table->integer('store_id')->default(0);
            $table->integer('commission_id')->default(0);
            $table->integer('user_id')->default(0);
            $table->boolean('active')->default(true);
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

    }

};
