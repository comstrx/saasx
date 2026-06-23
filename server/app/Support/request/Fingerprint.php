<?php

declare(strict_types=1);

namespace App\Support\Request;
use App\Support\Security;

class Fingerprint {

    public static function make (): string {

        $parts = [
            \Illuminate\Support\Facades\Request::ip() ?? '',
            \Illuminate\Support\Facades\Request::userAgent() ?? '',
            \Illuminate\Support\Facades\Request::method(),
            \Illuminate\Support\Facades\Request::path(),
        ];

        return Security::digest(implode('|', $parts));

    }

}
