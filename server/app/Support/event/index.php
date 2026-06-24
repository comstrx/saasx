<?php

declare(strict_types=1);

namespace App\Support;
use App\Support\Event\Driver;
use App\Support\Event\RedisDriver;
use App\Support\Event\Payload;

class Event {

    protected static ?Driver $driver = null;

    /** @param array<string, mixed> $payload */
    public static function publish ( string $event, array $payload = [], ?string $key = null ): void {

        self::driver()->publish(Payload::make($event, $payload, $key));

    }
    protected static function driver (): Driver {

        return self::$driver ??= new RedisDriver();

    }

}
