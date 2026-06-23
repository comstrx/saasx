<?php

declare(strict_types=1);

namespace App\Support\Validate;

class Message {

    public static function get ( string $key, array $replace = [] ): string {

        $message = trans($key, $replace);

        return is_string($message) ? $message : $key;

    }

}
