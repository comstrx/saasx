<?php

declare(strict_types=1);

namespace App\Support;
use App\Support\Net\Ip;
use App\Support\Net\Url;
use App\Support\Net\Domain;
use App\Support\Net\Host;
use App\Support\Net\Port;

class Net {

    public static function validIp ( string $ip ): bool {

        return Ip::valid($ip);

    }
    public static function publicIp ( string $ip ): bool {

        return Ip::isPublic($ip);

    }
    public static function privateIp ( string $ip ): bool {

        return Ip::isPrivate($ip);

    }
    public static function validUrl ( string $url ): bool {

        return Url::valid($url);

    }
    /** @return array<string, mixed> */
    public static function parseUrl ( string $url ): array {

        return Url::parse($url);

    }
    public static function urlHost ( string $url ): ?string {

        return Url::host($url);

    }
    public static function urlScheme ( string $url ): ?string {

        return Url::scheme($url);

    }
    public static function subdomain ( string $host, ?string $base = null ): ?string {

        return Domain::subdomain($host, $base);

    }
    public static function apex ( string $host ): string {

        return Domain::apex($host);

    }
    public static function host ( string $host ): string {

        return Host::normalize($host);

    }
    public static function validPort ( int $port ): bool {

        return Port::valid($port);

    }
    public static function port ( ?int $port, int $default ): int {

        return Port::normalize($port, $default);

    }

}
