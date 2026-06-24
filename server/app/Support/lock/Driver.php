<?php

declare(strict_types=1);

namespace App\Support\Lock;

interface Driver {

    public function mutex ( string $key, int $ttl ): Mutex;
    public function forget ( string $key ): void;

}
