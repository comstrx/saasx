<?php

declare(strict_types=1);

namespace App\Support;
use App\Support\Cache\Driver;
use App\Support\Cache\RedisDriver;
use App\Support\Cache\Key;
use App\Support\Cache\Tag;
use App\Support\Cache\Entry;

class Cache {

    protected static ?Driver $driver = null;

    public static function get ( string $key, mixed $default = null ): mixed {

        return self::driver()->get(Key::make($key)) ?? $default;

    }
    public static function read ( string $key ): mixed {

        return self::driver()->get(Key::make($key));

    }
    /** @param list<string> $tags */
    public static function set ( string $key, mixed $value, ?int $ttl = null, array $tags = [] ): bool {

        $entry = new Entry($value, $ttl, $tags);
        $resolved = Key::make($key);
        $stored = self::driver()->put($resolved, $entry->value, $entry->ttl);

        Tag::index(self::driver(), $resolved, $entry->tags);

        return $stored;

    }
    /** @param list<string> $tags */
    public static function update ( string $key, mixed $value, ?int $ttl = null, array $tags = [] ): bool {

        return self::driver()->has(Key::make($key)) ? self::set($key, $value, $ttl, $tags) : false;

    }
    /** @param list<string> $tags */
    public static function remember ( string $key, ?int $ttl, callable $fn, array $tags = [] ): mixed {

        $resolved = Key::make($key);

        if ( self::driver()->has($resolved) ) return self::driver()->get($resolved);

        $value = $fn();

        self::set($key, $value, $ttl, $tags);

        return $value;

    }
    /** @param list<string> $tags */
    public static function refresh ( string $key, ?int $ttl, callable $fn, array $tags = [] ): mixed {

        $value = $fn();

        self::set($key, $value, $ttl, $tags);

        return $value;

    }
    public static function forget ( string $key ): bool {

        return self::driver()->forget(Key::make($key));

    }
    /** @return list<string> */
    public static function index ( string $tag ): array {

        return Tag::members(self::driver(), $tag);

    }
    public static function reset ( string $tag ): void {

        Tag::reset(self::driver(), $tag);

    }
    /** @param list<string> $tags */
    public static function rememberShared ( string $key, ?int $ttl, callable $fn, array $tags = [] ): mixed {

        $resolved = Key::shared($key);

        if ( self::driver()->has($resolved) ) return self::driver()->get($resolved);

        $entry = new Entry($fn(), $ttl, $tags);

        self::driver()->put($resolved, $entry->value, $entry->ttl);

        foreach ( $entry->tags as $tag ) self::driver()->addMembers(Key::sharedTag($tag), [$resolved]);

        return $entry->value;

    }
    public static function resetShared ( string $tag ): void {

        $resolved = Key::sharedTag($tag);

        foreach ( self::driver()->members($resolved) as $member ) self::driver()->forget($member);

        self::driver()->forgetMembers($resolved);

    }
    public static function flush (): bool {

        return self::driver()->flush();

    }
    protected static function driver (): Driver {

        return self::$driver ??= new RedisDriver();

    }

}
