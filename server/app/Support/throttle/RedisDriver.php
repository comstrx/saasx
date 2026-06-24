<?php

declare(strict_types=1);

namespace App\Support\Throttle;
use Illuminate\Cache\RateLimiter;

class RedisDriver implements Driver {

    public function hit ( string $key, int $window ): int {

        return $this->limiter()->hit($key, $window);

    }
    public function tooMany ( string $key, int $max ): bool {

        return $this->limiter()->tooManyAttempts($key, $max);

    }
    public function availableIn ( string $key ): int {

        return $this->limiter()->availableIn($key);

    }
    public function clear ( string $key ): void {

        $this->limiter()->clear($key);

    }
    protected function limiter (): RateLimiter {

        return new RateLimiter(\Illuminate\Support\Facades\Cache::store('rate_limit'));

    }

}
