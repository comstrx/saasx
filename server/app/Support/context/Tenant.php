<?php

declare(strict_types=1);

namespace App\Support\Context;

class Tenant {

    public const KEY = 'tenant_id';

    public static function id (): ?string {

        $value = \Illuminate\Support\Facades\Context::get(self::KEY);

        return is_string($value) && $value !== '' ? $value : null;

    }
    public static function set ( ?string $tenantId ): void {

        if ( $tenantId === null || $tenantId === '' ) {

            \Illuminate\Support\Facades\Context::forget(self::KEY);

            return;

        }

        \Illuminate\Support\Facades\Context::add(self::KEY, $tenantId);

    }

}
