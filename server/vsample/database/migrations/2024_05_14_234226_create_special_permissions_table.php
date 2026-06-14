<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up () {

        Schema::create('special_permissions', function (Blueprint $table) {
            $table->id();
            $table->integer('store_id')->default(0);
            $table->morphs('related');
            $table->integer('permission_id')->default(0);
            $table->boolean('allow')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

    }

};
