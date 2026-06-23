<?php

declare(strict_types=1);

namespace App\Support\Request;

class Header {

    public static function get ( string $name, ?string $default = null ): ?string {

        $value = \Illuminate\Support\Facades\Request::header($name, $default);

        return is_string($value) ? $value : $default;

    }
    public static function bearerToken (): ?string {

        return \Illuminate\Support\Facades\Request::bearerToken();

    }

}
