<?php

declare(strict_types=1);

namespace App\Support\Net;

class Host {

    public static function normalize ( string $host ): string {

        return self::withoutPort(strtolower(trim($host)));

    }
    public static function withoutPort ( string $host ): string {

        if ( str_starts_with($host, '[') ) return $host;

        $position = strrpos($host, ':');

        return $position === false ? $host : substr($host, 0, $position);

    }

}
