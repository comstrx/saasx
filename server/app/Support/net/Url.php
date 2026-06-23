<?php

declare(strict_types=1);

namespace App\Support\Net;

class Url {

    public static function valid ( string $url ): bool {

        return filter_var($url, FILTER_VALIDATE_URL) !== false;

    }
    /** @return array<string, mixed> */
    public static function parse ( string $url ): array {

        $parts = parse_url($url);

        return is_array($parts) ? $parts : [];

    }
    public static function host ( string $url ): ?string {

        $host = parse_url($url, PHP_URL_HOST);

        return is_string($host) ? $host : null;

    }
    public static function scheme ( string $url ): ?string {

        $scheme = parse_url($url, PHP_URL_SCHEME);

        return is_string($scheme) ? strtolower($scheme) : null;

    }

}
