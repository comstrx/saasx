<?php

declare(strict_types=1);

namespace App\Support\Parse;

class Query {

    /** @return array<int|string, mixed> */
    public static function parse ( string $query ): array {

        parse_str(ltrim($query, '?'), $result);

        return $result;

    }
    /** @return list<string> */
    public static function items ( string $value, string $separator = ',' ): array {

        $parts = array_map('trim', explode($separator === '' ? ',' : $separator, $value));

        return array_values(array_filter($parts, static fn ( string $part ): bool => $part !== ''));

    }

}
