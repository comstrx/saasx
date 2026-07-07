<?php

declare(strict_types=1);

namespace App\Support\str;

final class Str
{

    public static function upper ( string $text ): string
    {

        return mb_strtoupper($text);

    }
    public static function lower ( string $text ): string
    {

        return mb_strtolower($text);

    }
    public static function camel ( string $text ): string
    {

        $words = self::words($text);

        if ( $words === [] ) {

            return '';

        }

        $head = array_shift($words);

        return $head.implode('', array_map(self::ucfirst(...), $words));

    }
    public static function snake ( string $text ): string
    {

        return implode('_', self::words($text));

    }
    public static function kebab ( string $text ): string
    {

        return implode('-', self::words($text));

    }
    private static function words ( string $text ): array
    {

        $bounded = preg_replace('/([\p{Ll}\p{N}])(\p{Lu})/u', '$1 $2', $text);

        if ( $bounded === null ) {

            return [];

        }

        $parts = preg_split('/[\s_-]+/u', $bounded, -1, PREG_SPLIT_NO_EMPTY);

        if ( $parts === false ) {

            return [];

        }

        return array_map(mb_strtolower(...), $parts);

    }
    private static function ucfirst ( string $word ): string
    {

        return mb_strtoupper(mb_substr($word, 0, 1)).mb_substr($word, 1);

    }

}
