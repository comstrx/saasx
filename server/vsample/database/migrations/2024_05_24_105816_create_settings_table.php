<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up () {

        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->integer('store_id')->default(0);
            $table->nullableMorphs('related');
            $table->string('group');
            $table->string('key');
            $table->text('value')->nullable();
            $table->json('json_value')->nullable();
            $table->boolean('active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['store_id', 'related_type', 'related_id', 'key', 'deleted_at'], 'store_rel_key_del_uniq');
        });

    }

};
