<?php

declare(strict_types=1);

namespace App\Support\Lock;
use Illuminate\Contracts\Cache\Lock;

class Mutex {

    public function __construct ( protected Lock $lock ) {

    }
    public function acquire (): bool {

        return (bool) $this->lock->get();

    }
    public function release (): void {

        $this->lock->release();

    }
    public function block ( int $seconds, \Closure $fn ): mixed {

        return $this->lock->block($seconds, $fn);

    }

}
