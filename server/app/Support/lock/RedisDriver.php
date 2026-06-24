<?php

declare(strict_types=1);

namespace App\Support\Lock;

class RedisDriver implements Driver {

    public function mutex ( string $key, int $ttl ): Mutex {

        return new Mutex(\Illuminate\Support\Facades\Cache::lock($key, $ttl));

    }
    public function forget ( string $key ): void {

        \Illuminate\Support\Facades\Cache::lock($key)->forceRelease();

    }

}
