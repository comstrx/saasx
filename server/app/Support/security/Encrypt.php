<?php

declare(strict_types=1);

namespace App\Support\Security;

class Encrypt {

    public static function encrypt ( mixed $value ): string {

        return \Illuminate\Support\Facades\Crypt::encrypt($value);

    }
    public static function decrypt ( string $payload ): mixed {

        return \Illuminate\Support\Facades\Crypt::decrypt($payload);

    }

}
