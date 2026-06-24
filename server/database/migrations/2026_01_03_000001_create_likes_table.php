<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up (): void {

        Schema::create('likes', function ( Blueprint $table ): void {

            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->nullable()->index();
            $table->uuidMorphs('engageable');
            $table->uuid('user_id');
            $table->boolean('value')->default(true);
            $table->timestamps();

            $table->unique(['engageable_type', 'engageable_id', 'user_id', 'tenant_id']);

        });

        if ( DB::connection()->getDriverName() !== 'pgsql' ) return;

        DB::statement('ALTER TABLE likes ENABLE ROW LEVEL SECURITY');
        DB::statement('ALTER TABLE likes FORCE ROW LEVEL SECURITY');
        DB::statement("CREATE POLICY likes_tenant_isolation ON likes USING (tenant_id IS NULL OR tenant_id = current_setting('app.tenant_id', true)::uuid)");

    }
    public function down (): void {

        if ( DB::connection()->getDriverName() === 'pgsql' ) DB::statement('DROP POLICY IF EXISTS likes_tenant_isolation ON likes');

        Schema::dropIfExists('likes');

    }

};
