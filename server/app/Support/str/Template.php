<?php

declare(strict_types=1);

namespace App\Support\Str;

class Template {

    public static function render ( string $template, array $data, string $open = '{', string $close = '}' ): string {

        $pairs = [];

        foreach ( $data as $key => $value ) {

            $pairs[$open . $key . $close] = self::stringify($value);

        }

        return strtr($template, $pairs);

    }
    public static function swap ( array $pairs, string $subject ): string {

        $replace = [];

        foreach ( $pairs as $search => $value ) {

            $replace[$search] = self::stringify($value);

        }

        return strtr($subject, $replace);

    }
    private static function stringify ( string|int|float|bool|null $value ): string {

        return match ( true ) {

            is_bool($value) => $value ? 'true' : 'false',
            $value === null => '',
            default         => (string) $value,

        };

    }

}
