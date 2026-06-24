<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up (): void {

        Schema::create('users', function ( Blueprint $table ): void {

            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->nullable()->index();
            $table->string('name');
            $table->string('email');
            $table->string('password');
            $table->timestamp('email_verified_at')->nullable();
            $table->timestamps();

            $table->unique(['email', 'tenant_id']);

        });

    }
    public function down (): void {

        Schema::dropIfExists('users');

    }

};
