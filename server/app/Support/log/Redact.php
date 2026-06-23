<?php

declare(strict_types=1);

namespace App\Support\Log;

class Redact {

    private const SENSITIVE = [
        'password', 'secret', 'token', 'authorization', 'api_key', 'apikey',
        'access_token', 'refresh_token', 'card', 'cvv', 'pin', 'credentials',
    ];

    private const MASK = '[redacted]';

    /** @return array<string, mixed> */
    public static function apply ( array $context ): array {

        $result = [];

        foreach ( $context as $key => $value ) {

            if ( is_array($value) ) {

                $result[$key] = self::apply($value);

                continue;

            }

            $result[$key] = self::sensitive((string) $key) ? self::MASK : $value;

        }

        return $result;

    }
    private static function sensitive ( string $key ): bool {

        $key = strtolower($key);

        foreach ( self::SENSITIVE as $needle ) {

            if ( str_contains($key, $needle) ) return true;

        }

        return false;

    }

}
