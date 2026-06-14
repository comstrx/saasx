<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up () {

        Schema::create('reports', function ( Blueprint $table ) {
            $table->id();
            $table->integer('store_id')->default(0);
            $table->integer('user_id')->default(0);
            $table->morphs('related');

            $table->string('reason')->nullable();
            $table->string('title')->nullable();
            $table->longText('content')->nullable();

            $table->enum('status', ['pending', 'reviewed', 'replied', 'resolved', 'closed'])->default('pending');
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamp('replied_at')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamp('closed_at')->nullable();

            $table->string('ip')->nullable();
            $table->string('agent')->nullable();
            $table->integer('views')->default(0);
            $table->integer('likes')->default(0);
            $table->integer('dislikes')->default(0);
            $table->boolean('deleted')->default(false);
            $table->boolean('active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

    }

};
