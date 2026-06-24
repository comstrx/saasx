<?php

declare(strict_types=1);

namespace App\Support\Queue;

class Retry {

    public static function backoff ( int $attempt, int $base = 5, int $cap = 600 ): int {

        return (int) min($cap, $base * 2 ** max(0, $attempt - 1));

    }

}
