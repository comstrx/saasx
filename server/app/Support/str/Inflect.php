<?php

declare(strict_types=1);

namespace App\Support\Str;

class Inflect {

    private const IRREGULAR = [
        'man'    => 'men',
        'woman'  => 'women',
        'child'  => 'children',
        'person' => 'people',
        'tooth'  => 'teeth',
        'foot'   => 'feet',
        'mouse'  => 'mice',
        'goose'  => 'geese',
    ];

    private const UNCOUNTABLE = [
        'equipment', 'information', 'rice', 'money', 'species',
        'series', 'fish', 'sheep', 'data', 'staff', 'news',
    ];

    public static function plural ( string $value, int $count = 2 ): string {

        if ( $count === 1 || self::uncountable($value) ) return $value;

        $lower = Casing::lower($value);

        foreach ( self::IRREGULAR as $single => $plural ) {

            if ( $lower === $single ) return self::preserve($value, $plural);

        }

        return match ( true ) {

            (bool) preg_match('/(s|x|z|ch|sh)$/i', $value) => $value . 'es',
            (bool) preg_match('/[^aeiou]y$/i', $value)     => preg_replace('/y$/i', 'ies', $value) ?? $value . 's',
            (bool) preg_match('/(fe|f)$/i', $value)        => preg_replace('/(fe|f)$/i', 'ves', $value) ?? $value . 's',
            default                                        => $value . 's',

        };

    }

    public static function singular ( string $value ): string {

        if ( self::uncountable($value) ) return $value;

        $lower = Casing::lower($value);

        foreach ( self::IRREGULAR as $single => $plural ) {

            if ( $lower === $plural ) return self::preserve($value, $single);

        }

        return match ( true ) {

            (bool) preg_match('/ies$/i', $value)                     => preg_replace('/ies$/i', 'y', $value) ?? $value,
            (bool) preg_match('/ves$/i', $value)                     => preg_replace('/ves$/i', 'f', $value) ?? $value,
            (bool) preg_match('/(ses|xes|zes|ches|shes)$/i', $value) => preg_replace('/es$/i', '', $value) ?? $value,
            (bool) preg_match('/s$/i', $value)                       => preg_replace('/s$/i', '', $value) ?? $value,
            default                                                  => $value,

        };

    }

    private static function uncountable ( string $value ): bool {

        return in_array(Casing::lower($value), self::UNCOUNTABLE, true);

    }

    private static function preserve ( string $original, string $replacement ): string {

        if ( $original === Casing::upper($original) ) return Casing::upper($replacement);

        if ( $original === Casing::ucfirst(Casing::lower($original)) ) return Casing::ucfirst($replacement);

        return $replacement;

    }

}
