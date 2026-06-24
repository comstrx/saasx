<?php

declare(strict_types=1);

namespace App\Support\Storage;
use App\Support\Date;

class TemporaryUrl {

    public static function for ( Driver $driver, string $key, int $minutes ): string {

        return $driver->temporaryUrl($key, Date::now()->addMinutes($minutes));

    }

}
