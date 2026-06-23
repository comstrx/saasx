<?php

declare(strict_types=1);

namespace App\Support\Cast;

class Scalar {

    public static function string ( mixed $value ): ?string {

        if ( is_array($value) || is_object($value) ) return null;

        $value = trim((string) $value);

        return in_array($value, ['', 'null', 'undefined'], true) ? null : $value;

    }
    public static function integer ( mixed $value ): ?int {

        if ( is_int($value) ) return $value;

        $value = self::string($value);

        return $value !== null && is_numeric($value) ? (int) $value : null;

    }
    public static function float ( mixed $value ): ?float {

        if ( is_float($value) || is_int($value) ) return (float) $value;

        $value = self::string($value);

        return $value !== null && is_numeric($value) ? (float) $value : null;

    }
    public static function boolean ( mixed $value ): bool {

        if ( is_bool($value) ) return $value;

        return in_array(strtolower(trim((string) $value)), ['1', 'true', 'yes', 'on'], true);

    }

}
