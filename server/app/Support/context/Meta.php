<?php

declare(strict_types=1);

namespace App\Support\Context;

class Meta {

    public static function get ( string $key, mixed $default = null ): mixed {

        return \Illuminate\Support\Facades\Context::get($key, $default);

    }
    public static function set ( string $key, mixed $value ): void {

        \Illuminate\Support\Facades\Context::add($key, $value);

    }
    public static function has ( string $key ): bool {

        return \Illuminate\Support\Facades\Context::has($key);

    }
    public static function forget ( string $key ): void {

        \Illuminate\Support\Facades\Context::forget($key);

    }

}
