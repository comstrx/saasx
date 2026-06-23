<?php

declare(strict_types=1);

namespace App\Support\Http;

class Header {

    /**
     * @param  array<mixed> $headers
     * @return array<string, string>
     */
    public static function flatten ( array $headers ): array {

        $flat = [];

        foreach ( $headers as $name => $value ) {

            $flat[strtolower(trim((string) $name))] = is_array($value)
                ? implode(', ', array_map(static fn ( mixed $item ): string => (string) $item, $value))
                : (string) $value;

        }

        return $flat;

    }
    /** @param array<mixed> $headers */
    public static function get ( array $headers, string $name ): ?string {

        return self::flatten($headers)[strtolower(trim($name))] ?? null;

    }

}
