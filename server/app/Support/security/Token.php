<?php

declare(strict_types=1);

namespace App\Support\Security;

class Token {

    public static function random ( int $bytes = 32 ): string {

        return bin2hex(random_bytes(max($bytes, 1)));

    }
    public static function urlSafe ( int $bytes = 32 ): string {

        return rtrim(strtr(base64_encode(random_bytes(max($bytes, 1))), '+/', '-_'), '=');

    }

}
