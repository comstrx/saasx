<?php

declare(strict_types=1);

namespace App\Support\Queue;

interface Driver {

    public function push ( Payload $job, ?string $queue = null ): void;

}
