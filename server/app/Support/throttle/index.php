<?php

declare(strict_types=1);

namespace App\Support;
use App\Support\Throttle\Driver;
use App\Support\Throttle\RedisDriver;

class Throttle {

    protected static ?Driver $driver = null;

    public static function attempt ( string $key, int $max, int $window, \Closure $fn ): mixed {

        $resolved = self::key($key);

        if ( self::driver()->tooMany($resolved, $max) ) throw new \RuntimeException('Too many attempts.');

        self::driver()->hit($resolved, $window);

        return $fn();

    }
    public static function tooMany ( string $key, int $max, int $window ): bool {

        return self::driver()->tooMany(self::key($key), $max);

    }
    public static function hit ( string $key, int $window ): int {

        return self::driver()->hit(self::key($key), $window);

    }
    public static function clear ( string $key ): void {

        self::driver()->clear(self::key($key));

    }
    public static function retryAfter ( string $key ): int {

        return self::driver()->availableIn(self::key($key));

    }
    protected static function key ( string $key ): string {

        return 't:' . (Context::tenantId() ?? 'platform') . ':throttle:' . $key;

    }
    protected static function driver (): Driver {

        return self::$driver ??= new RedisDriver();

    }

}
