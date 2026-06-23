<?php

declare(strict_types=1);

namespace App\Support;
use App\Support\Arr\Dot;
use App\Support\Arr\Shape;
use App\Support\Arr\Filter;
use App\Support\Arr\Map;
use App\Support\Arr\Group;
use App\Support\Arr\Sort;
use App\Support\Arr\Tree;

class Arr {

    public static function get ( array $array, string $key, mixed $default = null ): mixed {

        return Dot::get($array, $key, $default);

    }
    public static function has ( array $array, string $key ): bool {

        return Dot::has($array, $key);

    }
    /** @return array<mixed> */
    public static function set ( array $array, string $key, mixed $value ): array {

        return Dot::set($array, $key, $value);

    }
    /** @return array<mixed> */
    public static function forget ( array $array, string $key ): array {

        return Dot::forget($array, $key);

    }
    /** @return array<string, mixed> */
    public static function flatten ( array $array, string $prefix = '' ): array {

        return Dot::flatten($array, $prefix);

    }
    /** @return array<mixed> */
    public static function only ( array $array, array $keys ): array {

        return Shape::only($array, $keys);

    }
    /** @return array<mixed> */
    public static function except ( array $array, array $keys ): array {

        return Shape::except($array, $keys);

    }
    /** @return array<mixed> */
    public static function pluck ( array $array, string $value, ?string $key = null ): array {

        return Shape::pluck($array, $value, $key);

    }
    /** @return array<mixed> */
    public static function wrap ( mixed $value ): array {

        return Shape::wrap($value);

    }
    /** @return array<mixed> */
    public static function where ( array $array, callable $callback ): array {

        return Filter::where($array, $callback);

    }
    /** @return array<mixed> */
    public static function reject ( array $array, callable $callback ): array {

        return Filter::reject($array, $callback);

    }
    /** @return array<mixed> */
    public static function whereNotNull ( array $array ): array {

        return Filter::whereNotNull($array);

    }
    public static function first ( array $array, ?callable $callback = null, mixed $default = null ): mixed {

        return Filter::first($array, $callback, $default);

    }
    /** @return array<mixed> */
    public static function map ( array $array, callable $callback ): array {

        return Map::map($array, $callback);

    }
    /** @return array<mixed> */
    public static function mapWithKeys ( array $array, callable $callback ): array {

        return Map::mapWithKeys($array, $callback);

    }
    /** @return array<mixed> */
    public static function flatMap ( array $array, callable $callback ): array {

        return Map::flatMap($array, $callback);

    }
    /** @return array<int|string, list<mixed>> */
    public static function groupBy ( array $array, callable|string $key ): array {

        return Group::groupBy($array, $key);

    }
    /** @return array<int|string, mixed> */
    public static function keyBy ( array $array, callable|string $key ): array {

        return Group::keyBy($array, $key);

    }
    /** @return array{0: list<mixed>, 1: list<mixed>} */
    public static function partition ( array $array, callable $callback ): array {

        return Group::partition($array, $callback);

    }
    /** @return array<mixed> */
    public static function sort ( array $array, bool $desc = false ): array {

        return Sort::sort($array, $desc);

    }
    /** @return array<mixed> */
    public static function sortBy ( array $array, callable|string $key, bool $desc = false ): array {

        return Sort::sortBy($array, $key, $desc);

    }
    /** @return array<mixed> */
    public static function sortKeys ( array $array, bool $desc = false ): array {

        return Sort::sortKeys($array, $desc);

    }
    /** @return list<array<string, mixed>> */
    public static function nest ( array $items, string $id = 'id', string $parent = 'parent_id', string $children = 'children' ): array {

        return Tree::nest($items, $id, $parent, $children);

    }
    /** @return list<array<string, mixed>> */
    public static function flattenTree ( array $tree, string $children = 'children' ): array {

        return Tree::flatten($tree, $children);

    }

}
