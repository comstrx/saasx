<?php

declare(strict_types=1);

namespace App\Support\Request;
use App\Support\Context;
use App\Support\Security;

class Idempotency {

    public const HEADER = 'Idempotency-Key';

    public static function key (): ?string {

        $key = Header::get(self::HEADER);

        return $key !== null && $key !== '' ? $key : null;

    }
    public static function scopedKey ( string $endpoint ): ?string {

        $key = self::key();

        if ( $key === null ) return null;

        $scope = [Context::tenantId() ?? 'global', Context::userId() ?? 'guest', $endpoint, $key];

        return Security::digest(implode(':', $scope));

    }

}
