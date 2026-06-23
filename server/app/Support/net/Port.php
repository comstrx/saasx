<?php

declare(strict_types=1);

namespace App\Support\Net;

class Port {

    public static function valid ( int $port ): bool {

        return $port >= 1 && $port <= 65535;

    }
    public static function normalize ( ?int $port, int $default ): int {

        return $port !== null && self::valid($port) ? $port : $default;

    }

}
