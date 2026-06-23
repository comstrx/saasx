<?php

declare(strict_types=1);

namespace App\Support\Http;

class Retry {

    public function __construct ( public readonly int $times = 3, public readonly int $baseMilliseconds = 100, public readonly int $multiplier = 2 ) {

    }
    public function backoff ( int $attempt ): int {

        return (int) ($this->baseMilliseconds * $this->multiplier ** max(0, $attempt - 1));

    }

}
