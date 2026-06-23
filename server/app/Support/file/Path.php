<?php

declare(strict_types=1);

namespace App\Support\File;

class Path {

    public static function join ( string ...$parts ): string {

        $clean = array_map(static fn ( string $part ): string => trim($part, '/'), array_filter($parts, static fn ( string $part ): bool => $part !== ''));

        return implode('/', $clean);

    }
    public static function normalize ( string $path ): string {

        $prefix = str_starts_with($path, '/') ? '/' : '';
        $segments = [];

        foreach ( explode('/', str_replace('\\', '/', $path)) as $segment ) {

            if ( $segment === '' || $segment === '.' ) continue;

            if ( $segment === '..' ) {

                array_pop($segments);

                continue;

            }

            $segments[] = $segment;

        }

        return $prefix . implode('/', $segments);

    }
    public static function extension ( string $path ): string {

        return strtolower(pathinfo($path, PATHINFO_EXTENSION));

    }
    public static function dirname ( string $path ): string {

        return pathinfo($path, PATHINFO_DIRNAME);

    }
    public static function basename ( string $path ): string {

        return pathinfo($path, PATHINFO_BASENAME);

    }
    public static function filename ( string $path ): string {

        return pathinfo($path, PATHINFO_FILENAME);

    }

}
