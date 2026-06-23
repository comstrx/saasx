<?php

declare(strict_types=1);

namespace App\Support\Context;

class User {

    public const KEY = 'user_id';

    public static function id (): ?string {

        $value = \Illuminate\Support\Facades\Context::get(self::KEY);

        return is_string($value) && $value !== '' ? $value : null;

    }
    public static function set ( ?string $userId ): void {

        if ( $userId === null || $userId === '' ) {

            \Illuminate\Support\Facades\Context::forget(self::KEY);

            return;

        }

        \Illuminate\Support\Facades\Context::add(self::KEY, $userId);

    }

}
