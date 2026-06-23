<?php

declare(strict_types=1);

namespace App\Support\Arr;

class Map {

    /** @return array<mixed> */
    public static function map ( array $array, callable $callback ): array {

        $keys = array_keys($array);

        return array_combine($keys, array_map($callback, $array, $keys));

    }
    /** @return array<mixed> */
    public static function mapWithKeys ( array $array, callable $callback ): array {

        $result = [];

        foreach ( $array as $key => $value ) {

            foreach ( $callback($value, $key) as $mapKey => $mapValue ) {

                $result[$mapKey] = $mapValue;

            }

        }

        return $result;

    }
    /** @return array<mixed> */
    public static function flatMap ( array $array, callable $callback ): array {

        $result = [];

        foreach ( $array as $key => $value ) {

            $mapped = $callback($value, $key);

            if ( is_array($mapped) ) {

                $result = array_merge($result, $mapped);

                continue;

            }

            $result[] = $mapped;

        }

        return $result;

    }

}
