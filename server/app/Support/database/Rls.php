<?php

declare(strict_types=1);

namespace App\Support\Database;
use App\Support\Context;

class Rls {

    public static function apply ( ?string $tenantId = null ): void {

        $tenantId ??= Context::tenantId();

        \Illuminate\Support\Facades\DB::statement("select set_config('app.tenant_id', ?, true)", [(string) $tenantId]);

    }

}
