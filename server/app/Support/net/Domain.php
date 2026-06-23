<?php

declare(strict_types=1);

namespace App\Support\Net;

class Domain {

    public static function subdomain ( string $host, ?string $base = null ): ?string {

        $host = strtolower(trim($host));

        if ( $base !== null ) {

            $base = strtolower(trim($base));

            if ( $host === $base || ! str_ends_with($host, '.' . $base) ) return null;

            return substr($host, 0, -strlen('.' . $base)) ?: null;

        }

        $labels = explode('.', $host);

        return count($labels) > 2 ? $labels[0] : null;

    }
    public static function apex ( string $host ): string {

        $labels = explode('.', strtolower(trim($host)));

        return implode('.', array_slice($labels, -2));

    }

}
