<?php

declare(strict_types=1);

namespace App\Support\Queue;
use App\Support\Context;

class Tenant {

    /** @return array{panel: string, role: string, tenant_id: string|null, user_id: string|null} */
    public static function stamp (): array {

        return [
            'panel'     => Context::panel(),
            'role'      => Context::role(),
            'tenant_id' => Context::tenantId(),
            'user_id'   => Context::userId(),
        ];

    }
    /** @param array{panel: string, role: string, tenant_id: string|null, user_id: string|null} $ctx */
    public static function restore ( array $ctx ): void {

        Context::set($ctx['panel'], $ctx['role'], $ctx['tenant_id'], $ctx['user_id']);

    }
    public static function reset (): void {

        Context::forget();

    }

}
