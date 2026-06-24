<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up (): void {

        Schema::create('permission_settings', function ( Blueprint $table ): void {

            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->nullable();
            $table->uuid('permission_id');
            $table->string('scope');
            $table->string('role')->nullable();
            $table->string('target_type')->nullable();
            $table->uuid('target_id')->nullable();
            $table->uuid('user_id')->nullable();
            $table->boolean('allow')->default(false);
            $table->boolean('locked')->default(false);
            $table->string('authority');
            $table->timestamps();

            $table->foreign('permission_id')->references('id')->on('permissions')->cascadeOnDelete();

            $table->unique(['tenant_id', 'permission_id', 'scope', 'role', 'target_type', 'target_id', 'user_id'], 'permission_settings_scope_unique');
            $table->index(['tenant_id', 'permission_id', 'scope']);

        });

    }
    public function down (): void {

        Schema::dropIfExists('permission_settings');

    }

};
