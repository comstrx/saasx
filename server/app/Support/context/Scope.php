<?php

declare(strict_types=1);

namespace App\Support\Context;

class Scope {

    public const KEY = 'role';

    public static function role (): string {

        $value = \Illuminate\Support\Facades\Context::get(self::KEY);

        return is_string($value) ? $value : 'guest';

    }
    public static function set ( string $role ): void {

        \Illuminate\Support\Facades\Context::add(self::KEY, $role);

    }
    public static function isSuper (): bool {

        return Panel::get() === 'super';

    }

}
