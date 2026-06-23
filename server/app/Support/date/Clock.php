<?php

declare(strict_types=1);

namespace App\Support\Date;

class Clock {

    public static function now ( ?string $timezone = null ): \Carbon\CarbonImmutable {

        return \Carbon\CarbonImmutable::now($timezone);

    }
    public static function today ( ?string $timezone = null ): \Carbon\CarbonImmutable {

        return \Carbon\CarbonImmutable::today($timezone);

    }
    public static function timestamp (): int {

        return \Carbon\CarbonImmutable::now()->getTimestamp();

    }

}
