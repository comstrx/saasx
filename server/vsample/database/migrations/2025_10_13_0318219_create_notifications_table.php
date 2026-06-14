<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up () {

        Schema::create('notifications', function ( Blueprint $table ) {
            $table->id();
            $table->unsignedBigInteger('store_id')->default(0);
            $table->unsignedBigInteger('related_id')->nullable();
            $table->string('related_type')->nullable();
            $table->enum('target', ['private', 'public', 'admin', 'vendor', 'delivery', 'client'])->default('private');
            $table->string('type')->nullable();
            $table->string('title')->nullable();
            $table->longText('content')->nullable();
            $table->boolean('active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['store_id', 'target', 'related_id', 'related_type', 'deleted_at'], 'notif_store_target_related_del_idx');
        });

    }

};
