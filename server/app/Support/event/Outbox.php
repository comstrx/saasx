<?php

declare(strict_types=1);

namespace App\Support\Event;

class Outbox {

    /** @param array<string, mixed> $payload */
    public static function record ( string $event, array $payload, ?string $key ): void {

        Payload::make($event, $payload, $key);

    }

}
