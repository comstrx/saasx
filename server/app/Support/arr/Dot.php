<?php

declare(strict_types=1);

namespace App\Support\Arr;

class Dot {

    public static function get ( array $array, string $key, mixed $default = null ): mixed {

        if ( array_key_exists($key, $array) ) return $array[$key];

        $segment = $array;

        foreach ( explode('.', $key) as $part ) {

            if ( ! is_array($segment) || ! array_key_exists($part, $segment) ) return $default;

            $segment = $segment[$part];

        }

        return $segment;

    }
    public static function has ( array $array, string $key ): bool {

        $segment = $array;

        foreach ( explode('.', $key) as $part ) {

            if ( ! is_array($segment) || ! array_key_exists($part, $segment) ) return false;

            $segment = $segment[$part];

        }

        return true;

    }
    /** @return array<mixed> */
    public static function set ( array $array, string $key, mixed $value ): array {

        $segment = &$array;

        $parts = explode('.', $key);
        $last = array_key_last($parts);

        foreach ( $parts as $index => $part ) {

            if ( $index === $last ) break;

            if ( ! isset($segment[$part]) || ! is_array($segment[$part]) ) $segment[$part] = [];

            $segment = &$segment[$part];

        }

        $segment[$parts[$last]] = $value;

        return $array;

    }
    /** @return array<mixed> */
    public static function forget ( array $array, string $key ): array {

        $segment = &$array;

        $parts = explode('.', $key);
        $last = array_key_last($parts);

        foreach ( $parts as $index => $part ) {

            if ( $index === $last ) break;

            if ( ! isset($segment[$part]) || ! is_array($segment[$part]) ) return $array;

            $segment = &$segment[$part];

        }

        unset($segment[$parts[$last]]);

        return $array;

    }
    /** @return array<string, mixed> */
    public static function flatten ( array $array, string $prefix = '' ): array {

        $result = [];

        foreach ( $array as $key => $value ) {

            $path = $prefix === '' ? (string) $key : $prefix . '.' . $key;

            if ( is_array($value) && $value !== [] ) {

                $result = array_merge($result, self::flatten($value, $path));

                continue;

            }

            $result[$path] = $value;

        }

        return $result;

    }

}
