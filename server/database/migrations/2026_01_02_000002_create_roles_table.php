<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up (): void {

        Schema::create('roles', function ( Blueprint $table ): void {

            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->nullable()->index();
            $table->string('role');
            $table->boolean('is_super')->default(false);
            $table->boolean('is_supervisor')->default(false);
            $table->timestamps();

            $table->index(['tenant_id', 'role']);

        });

    }
    public function down (): void {

        Schema::dropIfExists('roles');

    }

};
