<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up () {

        Schema::create('contents', function ( Blueprint $table ) {
            $table->id();
            $table->integer('store_id')->default(0);

            $table->enum('type', ['page', 'banner', 'popup', 'block', 'widget', 'ad', 'sponsor', 'offer', 'slider'])->default('page');
            $table->enum('location', ['free', 'top', 'bottom', 'center', 'left', 'right'])->default('free');

            $table->integer('sort')->default(0);
            $table->string('key')->nullable();
            $table->string('page')->nullable();
            $table->string('value')->nullable();
            $table->string('url')->nullable();

            $table->json('title')->nullable();
            $table->json('content')->nullable();
            $table->json('description')->nullable();

            $table->text('notes')->nullable();
            $table->boolean('active')->default(true);
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

    }

};
