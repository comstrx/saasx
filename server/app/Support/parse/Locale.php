<?php

declare(strict_types=1);

namespace App\Support\Parse;

class Locale {

    public static function normalize ( string $value, array $supported, string $fallback = 'en' ): string {

        $value = strtolower(trim($value));
        $value = explode('-', str_replace('_', '-', $value))[0];

        return in_array($value, $supported, true) ? $value : $fallback;

    }

}
