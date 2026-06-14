<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up () {

        Schema::create('notification_users', function ( Blueprint $table ) {
            $table->id();
            $table->unsignedBigInteger('store_id')->default(0);
            $table->unsignedBigInteger('user_id')->default(0);
            $table->unsignedBigInteger('notification_id')->default(0);
            $table->boolean('active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['store_id', 'user_id', 'notification_id', 'deleted_at'], 'notif_users_store_user_notif_del_uniq');
            $table->index(['store_id', 'user_id', 'notification_id'], 'notif_users_lookup_idx');
        });

    }

};
