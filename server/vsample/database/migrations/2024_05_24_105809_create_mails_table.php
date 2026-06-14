<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up () {

        Schema::create('mails', function (Blueprint $table) {
            $table->id();
            $table->integer('store_id')->default(0);
            $table->integer('sender_id')->default(0);
            $table->integer('receiver_id')->default(0);
            $table->string('title')->nullable();
            $table->longText('description')->nullable();
            $table->longText('content')->nullable();
            $table->boolean('removed_sender')->default(false);
            $table->boolean('star_sender')->default(false);
            $table->boolean('important_sender')->default(false);
            $table->boolean('archived_sender')->default(false);
            $table->boolean('removed_receiver')->default(false);
            $table->boolean('star_receiver')->default(false);
            $table->boolean('important_receiver')->default(false);
            $table->boolean('archived_receiver')->default(false);
            $table->boolean('readen')->default(false);
            $table->boolean('active')->default(true);
            $table->timestamp('readen_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

    }

};
