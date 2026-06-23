<?php

declare(strict_types=1);

namespace App\Support\Database;

class Query {

    /** @param array<mixed> $values */
    public static function placeholders ( array $values ): string {

        return implode(', ', array_fill(0, count($values), '?'));

    }
    public static function escapeLike ( string $term ): string {

        return str_replace(['\\', '%', '_'], ['\\\\', '\\%', '\\_'], $term);

    }

}
