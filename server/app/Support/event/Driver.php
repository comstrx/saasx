<?php

declare(strict_types=1);

namespace App\Support\Event;

interface Driver {

    public function publish ( Payload $payload ): void;

}
