<?php

declare(strict_types=1);

namespace App\Support\Http;

class Status {

    public static function successful ( int $status ): bool {

        return $status >= 200 && $status < 300;

    }
    public static function redirect ( int $status ): bool {

        return $status >= 300 && $status < 400;

    }
    public static function clientError ( int $status ): bool {

        return $status >= 400 && $status < 500;

    }
    public static function serverError ( int $status ): bool {

        return $status >= 500 && $status < 600;

    }
    public static function failed ( int $status ): bool {

        return $status >= 400;

    }

}
