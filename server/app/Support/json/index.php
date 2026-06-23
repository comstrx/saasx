<?php

declare(strict_types=1);

namespace App\Support;
use App\Support\Json\Encode;
use App\Support\Json\Decode;
use App\Support\Json\Path;
use App\Support\Json\Shape;
use App\Support\Json\Merge;

class Json {

    public static function encode ( mixed $value, bool $pretty = false ): string {

        return Encode::encode($value, $pretty);

    }
    public static function decode ( string $json ): mixed {

        return Decode::decode($json);

    }
    /** @return array<mixed> */
    public static function toArray ( string $json ): array {

        return Decode::toArray($json);

    }
    public static function valid ( string $json ): bool {

        return Decode::valid($json);

    }
    public static function get ( string $json, string $key, mixed $default = null ): mixed {

        return Path::get($json, $key, $default);

    }
    public static function has ( string $json, string $key ): bool {

        return Path::has($json, $key);

    }
    /** @return array<mixed> */
    public static function only ( string $json, array $keys ): array {

        return Shape::only($json, $keys);

    }
    /** @return array<mixed> */
    public static function except ( string $json, array $keys ): array {

        return Shape::except($json, $keys);

    }
    /** @return array<mixed> */
    public static function merge ( array $base, array $overrides ): array {

        return Merge::deep($base, $overrides);

    }

}
