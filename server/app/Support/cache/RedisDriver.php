<?php

declare(strict_types=1);

namespace App\Support\Cache;

class RedisDriver implements Driver {

    public function get ( string $key ): mixed {

        return \Illuminate\Support\Facades\Cache::get($key);

    }
    public function has ( string $key ): bool {

        return \Illuminate\Support\Facades\Cache::has($key);

    }
    public function put ( string $key, mixed $value, ?int $ttl = null ): bool {

        return $ttl === null
            ? \Illuminate\Support\Facades\Cache::forever($key, $value)
            : \Illuminate\Support\Facades\Cache::put($key, $value, $ttl);

    }
    public function forget ( string $key ): bool {

        return \Illuminate\Support\Facades\Cache::forget($key);

    }
    public function flush (): bool {

        return \Illuminate\Support\Facades\Cache::flush();

    }
    /** @param list<string> $members */
    public function addMembers ( string $key, array $members ): void {

        if ( $members === [] ) return;

        \Illuminate\Support\Facades\Redis::connection('cache')->sadd($key, ...$members);

    }
    /** @return list<string> */
    public function members ( string $key ): array {

        $members = \Illuminate\Support\Facades\Redis::connection('cache')->smembers($key);

        return is_array($members)
            ? array_map(static fn ( mixed $member ): string => (string) $member, $members)
            : [];

    }
    public function forgetMembers ( string $key ): void {

        \Illuminate\Support\Facades\Redis::connection('cache')->del($key);

    }

}
