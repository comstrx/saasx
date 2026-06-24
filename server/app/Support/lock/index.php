<?php

declare(strict_types=1);

namespace App\Support;
use App\Support\Lock\Driver;
use App\Support\Lock\RedisDriver;
use App\Support\Lock\Mutex;

class Lock {

    protected static ?Driver $driver = null;

    public static function block ( string $key, int $seconds, \Closure $fn ): mixed {

        return self::get($key, $seconds)->block($seconds, $fn);

    }
    public static function acquire ( string $key, int $ttl ): bool {

        return self::get($key, $ttl)->acquire();

    }
    public static function release ( string $key ): void {

        self::driver()->forget(self::key($key));

    }
    public static function get ( string $key, int $ttl ): Mutex {

        return self::driver()->mutex(self::key($key), $ttl);

    }
    protected static function key ( string $key ): string {

        return 't:' . (Context::tenantId() ?? 'platform') . ':lock:' . $key;

    }
    protected static function driver (): Driver {

        return self::$driver ??= new RedisDriver();

    }

}
