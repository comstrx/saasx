<?php

declare(strict_types=1);

namespace App\Support\Date;

class Parse {

    public static function parse ( string $value, ?string $timezone = null ): \Carbon\CarbonImmutable {

        return \Carbon\CarbonImmutable::parse($value, $timezone);

    }
    public static function tryParse ( string $value, ?string $timezone = null ): ?\Carbon\CarbonImmutable {

        try {

            return self::parse($value, $timezone);

        }
        catch ( \Throwable ) {

            return null;

        }

    }

}
