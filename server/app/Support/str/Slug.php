<?php

declare(strict_types=1);

namespace App\Support\Str;

class Slug {

    public static function make ( string $value, string $separator = '-' ): string {

        return self::build(Casing::lower($value), $separator, '\p{L}\p{N}');

    }
    public static function ascii ( string $value, string $separator = '-' ): string {

        return self::build(Casing::lower(Clean::ascii($value)), $separator, 'a-z0-9');

    }
    private static function build ( string $value, string $separator, string $allowed ): string {

        $flip = $separator === '-' ? '_' : '-';

        $value = preg_replace('/[' . preg_quote($flip, '/') . ']+/u', $separator, $value) ?? $value;
        $value = preg_replace('/[^' . $allowed . preg_quote($separator, '/') . ']+/u', $separator, $value) ?? $value;
        $value = preg_replace('/[' . preg_quote($separator, '/') . ']+/u', $separator, $value) ?? $value;

        return trim($value, $separator);

    }

}
