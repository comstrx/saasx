<?php

declare(strict_types=1);

namespace App\Support\Database;

class Keyset {

    /** @param array<string, mixed> $cursor */
    public static function encode ( array $cursor ): string {

        return rtrim(strtr(base64_encode(json_encode($cursor, JSON_THROW_ON_ERROR)), '+/', '-_'), '=');

    }
    /** @return array<string, mixed> */
    public static function decode ( string $cursor ): array {

        $decoded = base64_decode(strtr($cursor, '-_', '+/'), true);

        if ( $decoded === false ) return [];

        $data = json_decode($decoded, true);

        if ( ! is_array($data) ) return [];

        $cursor = [];

        foreach ( $data as $key => $value ) {

            $cursor[(string) $key] = $value;

        }

        return $cursor;

    }

}
