<?php

declare(strict_types=1);

namespace App\Support\Arr;

class Group {

    /** @return array<int|string, list<mixed>> */
    public static function groupBy ( array $array, callable|string $key ): array {

        $result = [];

        foreach ( $array as $item ) {

            $result[self::resolve($item, $key)][] = $item;

        }

        return $result;

    }
    /** @return array<int|string, mixed> */
    public static function keyBy ( array $array, callable|string $key ): array {

        $result = [];

        foreach ( $array as $item ) {

            $result[self::resolve($item, $key)] = $item;

        }

        return $result;

    }
    /** @return array{0: list<mixed>, 1: list<mixed>} */
    public static function partition ( array $array, callable $callback ): array {

        $pass = $fail = [];

        foreach ( $array as $key => $value ) {

            if ( $callback($value, $key) ) $pass[] = $value;
            else $fail[] = $value;

        }

        return [$pass, $fail];

    }
    private static function resolve ( mixed $item, callable|string $key ): int|string {

        $value = is_callable($key) ? $key($item) : Dot::get((array) $item, $key);

        return is_int($value) ? $value : (string) $value;

    }

}
