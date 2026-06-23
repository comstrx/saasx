<?php

declare(strict_types=1);

namespace App\Support\Json;

use App\Support\Arr;

class Path {

    public static function get ( string $json, string $key, mixed $default = null ): mixed {

        return Arr::get(Decode::toArray($json), $key, $default);

    }
    public static function has ( string $json, string $key ): bool {

        return Arr::has(Decode::toArray($json), $key);

    }

}
