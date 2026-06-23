<?php

declare(strict_types=1);

namespace App\Support\Security;

class Signature {

    public static function sign ( string $payload, string $secret, string $algo = 'sha256' ): string {

        return hash_hmac($algo, $payload, $secret);

    }
    public static function verify ( string $payload, string $signature, string $secret, string $algo = 'sha256' ): bool {

        return hash_equals(self::sign($payload, $secret, $algo), $signature);

    }

}
