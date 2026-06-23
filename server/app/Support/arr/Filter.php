<?php

declare(strict_types=1);

namespace App\Support\Arr;

class Filter {

    /** @return array<mixed> */
    public static function where ( array $array, callable $callback ): array {

        return array_filter($array, $callback, ARRAY_FILTER_USE_BOTH);

    }
    /** @return array<mixed> */
    public static function reject ( array $array, callable $callback ): array {

        return array_filter($array, static fn ( mixed $value, mixed $key ): bool => ! $callback($value, $key), ARRAY_FILTER_USE_BOTH);

    }
    /** @return array<mixed> */
    public static function whereNotNull ( array $array ): array {

        return array_filter($array, static fn ( mixed $value ): bool => $value !== null);

    }
    public static function first ( array $array, ?callable $callback = null, mixed $default = null ): mixed {

        if ( $callback === null ) return $array === [] ? $default : reset($array);

        foreach ( $array as $key => $value ) {

            if ( $callback($value, $key) ) return $value;

        }

        return $default;

    }

}
