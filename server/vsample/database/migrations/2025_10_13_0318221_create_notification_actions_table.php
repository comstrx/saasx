<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up () {

        Schema::create('notification_actions', function ( Blueprint $table ) {
            $table->id();
            $table->unsignedBigInteger('store_id')->default(0);
            $table->unsignedBigInteger('user_id')->default(0);
            $table->unsignedBigInteger('notification_id')->default(0);
            $table->boolean('read')->default(false);
            $table->boolean('pinned')->default(false);
            $table->boolean('deleted')->default(false);
            $table->boolean('active')->default(true);
            $table->timestamp('read_at')->nullable();
            $table->timestamp('pinned_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        
            $table->unique(['store_id', 'user_id', 'notification_id', 'deleted_at'], 'notif_actions_store_user_notif_del_uniq');
            $table->index(['store_id', 'user_id', 'notification_id'], 'notif_actions_lookup_idx');
        });

    }

};
