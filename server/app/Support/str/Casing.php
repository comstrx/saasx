<?php

declare(strict_types=1);

namespace App\Support\Str;

class Casing {

    public static function lower ( string $value ): string {

        return mb_strtolower($value);

    }
    public static function upper ( string $value ): string {

        return mb_strtoupper($value);

    }
    public static function ucfirst ( string $value ): string {

        return self::upper(mb_substr($value, 0, 1)) . mb_substr($value, 1);

    }
    public static function lcfirst ( string $value ): string {

        return self::lower(mb_substr($value, 0, 1)) . mb_substr($value, 1);

    }
    /** @return list<string> */
    public static function words ( string $value ): array {

        $value = preg_replace('/([a-z0-9])([A-Z])/u', '$1 $2', trim($value)) ?? '';
        $value = preg_replace('/([A-Z]+)([A-Z][a-z])/u', '$1 $2', $value) ?? '';
        $parts = preg_split('/[\s\-_]+/u', $value) ?: [];

        return array_values(array_filter($parts, static fn ( string $part ): bool => $part !== ''));

    }
    public static function studly ( string $value ): string {

        $studly = '';

        foreach ( self::words($value) as $word ) {

            $studly .= self::ucfirst(self::lower($word));

        }

        return $studly;

    }
    public static function camel ( string $value ): string {

        return self::lcfirst(self::studly($value));

    }
    public static function snake ( string $value, string $separator = '_' ): string {

        $words = array_map(static fn ( string $word ): string => self::lower($word), self::words($value));

        return implode($separator, $words);

    }
    public static function kebab ( string $value ): string {

        return self::snake($value, '-');

    }
    public static function title ( string $value ): string {

        $words = array_map(static fn ( string $word ): string => self::ucfirst(self::lower($word)), self::words($value));

        return implode(' ', $words);

    }

}
