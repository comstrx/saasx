<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {

    /** @var list<string> */
    private array $tables = ['users', 'roles', 'permission_settings', 'user_roles'];

    public function up (): void {

        if ( DB::connection()->getDriverName() !== 'pgsql' ) return;

        foreach ( $this->tables as $table ) {

            DB::statement("ALTER TABLE {$table} ENABLE ROW LEVEL SECURITY");
            DB::statement("ALTER TABLE {$table} FORCE ROW LEVEL SECURITY");
            DB::statement("CREATE POLICY {$table}_tenant_isolation ON {$table} USING (tenant_id IS NULL OR tenant_id = current_setting('app.tenant_id', true)::uuid)");

        }

    }
    public function down (): void {

        if ( DB::connection()->getDriverName() !== 'pgsql' ) return;

        foreach ( $this->tables as $table ) {

            DB::statement("DROP POLICY IF EXISTS {$table}_tenant_isolation ON {$table}");
            DB::statement("ALTER TABLE {$table} DISABLE ROW LEVEL SECURITY");

        }

    }

};
