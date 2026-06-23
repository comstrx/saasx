<?php

declare(strict_types=1);

namespace App\Support\Arr;

class Shape {

    /** @return array<mixed> */
    public static function only ( array $array, array $keys ): array {

        return array_intersect_key($array, array_flip($keys));

    }
    /** @return array<mixed> */
    public static function except ( array $array, array $keys ): array {

        return array_diff_key($array, array_flip($keys));

    }
    /** @return array<mixed> */
    public static function pluck ( array $array, string $value, ?string $key = null ): array {

        $result = [];

        foreach ( $array as $item ) {

            $field = Dot::get((array) $item, $value);

            if ( $key === null ) {

                $result[] = $field;

                continue;

            }

            $result[Dot::get((array) $item, $key)] = $field;

        }

        return $result;

    }
    /** @return array<mixed> */
    public static function wrap ( mixed $value ): array {

        if ( $value === null ) return [];

        return is_array($value) ? $value : [$value];

    }

}
