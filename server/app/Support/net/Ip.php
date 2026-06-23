<?php

declare(strict_types=1);

namespace App\Support\Net;

class Ip {

    public static function valid ( string $ip ): bool {

        return filter_var($ip, FILTER_VALIDATE_IP) !== false;

    }
    public static function isPublic ( string $ip ): bool {

        return filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) !== false;

    }
    public static function isPrivate ( string $ip ): bool {

        return self::valid($ip) && ! self::isPublic($ip);

    }

}
