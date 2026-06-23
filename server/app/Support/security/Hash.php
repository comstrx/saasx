<?php

declare(strict_types=1);

namespace App\Support\Security;

class Hash {

    public static function make ( string $value ): string {

        return \Illuminate\Support\Facades\Hash::make($value);

    }
    public static function check ( string $value, string $hash ): bool {

        return $hash !== '' && \Illuminate\Support\Facades\Hash::check($value, $hash);

    }
    public static function needsRehash ( string $hash ): bool {

        return \Illuminate\Support\Facades\Hash::needsRehash($hash);

    }
    public static function digest ( string $value, string $algo = 'sha256' ): string {

        return hash($algo, $value);

    }

}
