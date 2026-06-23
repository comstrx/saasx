<?php

declare(strict_types=1);

namespace App\Support\Context;

class Panel {

    public const KEY = 'panel';

    public static function get (): string {

        $value = \Illuminate\Support\Facades\Context::get(self::KEY);

        return is_string($value) ? $value : 'guest';

    }
    public static function set ( string $panel ): void {

        \Illuminate\Support\Facades\Context::add(self::KEY, $panel);

    }

}
