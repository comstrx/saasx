<?php

declare(strict_types=1);

namespace App\Support\Throttle;

interface Driver {

    public function hit ( string $key, int $window ): int;
    public function tooMany ( string $key, int $max ): bool;
    public function availableIn ( string $key ): int;
    public function clear ( string $key ): void;

}
