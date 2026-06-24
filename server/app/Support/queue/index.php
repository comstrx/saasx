<?php

declare(strict_types=1);

namespace App\Support;
use App\Support\Queue\Driver;
use App\Support\Queue\Dispatch;
use App\Support\Queue\Payload;
use App\Support\Queue\Tenant;

class Queue {

    protected static ?Driver $driver = null;

    public static function dispatch ( object $job, ?string $queue = null ): void {

        self::driver()->push(new Payload($job, Tenant::stamp()), $queue);

    }
    protected static function driver (): Driver {

        return self::$driver ??= new Dispatch();

    }

}
