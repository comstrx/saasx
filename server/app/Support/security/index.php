<?php

declare(strict_types=1);

namespace App\Support;
use App\Support\Security\Token;
use App\Support\Security\Hash;
use App\Support\Security\Signature;
use App\Support\Security\Secret;
use App\Support\Security\Sanitize;
use App\Support\Security\Encrypt;

class Security {

    public static function token ( int $bytes = 32 ): string {

        return Token::random($bytes);

    }
    public static function urlToken ( int $bytes = 32 ): string {

        return Token::urlSafe($bytes);

    }
    public static function hash ( string $value ): string {

        return Hash::make($value);

    }
    public static function check ( string $value, string $hash ): bool {

        return Hash::check($value, $hash);

    }
    public static function needsRehash ( string $hash ): bool {

        return Hash::needsRehash($hash);

    }
    public static function digest ( string $value, string $algo = 'sha256' ): string {

        return Hash::digest($value, $algo);

    }
    public static function sign ( string $payload, string $secret, string $algo = 'sha256' ): string {

        return Signature::sign($payload, $secret, $algo);

    }
    public static function verify ( string $payload, string $signature, string $secret, string $algo = 'sha256' ): bool {

        return Signature::verify($payload, $signature, $secret, $algo);

    }
    public static function equals ( string $known, string $given ): bool {

        return Secret::equals($known, $given);

    }
    public static function sanitize ( string $value ): string {

        return Sanitize::text($value);

    }
    public static function escape ( string $value ): string {

        return Sanitize::html($value);

    }
    public static function encrypt ( mixed $value ): string {

        return Encrypt::encrypt($value);

    }
    public static function decrypt ( string $payload ): mixed {

        return Encrypt::decrypt($payload);

    }

}
