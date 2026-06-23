<?php

declare(strict_types=1);

namespace App\Support\Arr;

class Sort {

    /** @return array<mixed> */
    public static function sort ( array $array, bool $desc = false ): array {

        $desc ? rsort($array) : sort($array);

        return $array;

    }
    /** @return array<mixed> */
    public static function sortBy ( array $array, callable|string $key, bool $desc = false ): array {

        $callback = is_callable($key) ? $key : static fn ( mixed $item ): mixed => Dot::get((array) $item, $key);

        usort($array, static function ( mixed $a, mixed $b ) use ( $callback, $desc ): int {

            $order = $callback($a) <=> $callback($b);

            return $desc ? -$order : $order;

        });

        return $array;

    }
    /** @return array<mixed> */
    public static function sortKeys ( array $array, bool $desc = false ): array {

        $desc ? krsort($array) : ksort($array);

        return $array;

    }

}
