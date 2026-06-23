<?php

declare(strict_types=1);

namespace App\Support;
use App\Support\Date\Clock;
use App\Support\Date\Parse;
use App\Support\Date\Format;
use App\Support\Date\Range;

class Date {

    public static function now ( ?string $timezone = null ): \Carbon\CarbonImmutable {

        return Clock::now($timezone);

    }
    public static function today ( ?string $timezone = null ): \Carbon\CarbonImmutable {

        return Clock::today($timezone);

    }
    public static function timestamp (): int {

        return Clock::timestamp();

    }
    public static function parse ( string $value, ?string $timezone = null ): \Carbon\CarbonImmutable {

        return Parse::parse($value, $timezone);

    }
    public static function tryParse ( string $value, ?string $timezone = null ): ?\Carbon\CarbonImmutable {

        return Parse::tryParse($value, $timezone);

    }
    public static function iso ( \Carbon\CarbonInterface $date ): string {

        return Format::iso($date);

    }
    public static function format ( \Carbon\CarbonInterface $date, string $format ): string {

        return Format::custom($date, $format);

    }
    public static function human ( \Carbon\CarbonInterface $date ): string {

        return Format::human($date);

    }
    public static function contains ( \Carbon\CarbonInterface $value, \Carbon\CarbonInterface $start, \Carbon\CarbonInterface $end ): bool {

        return Range::contains($value, $start, $end);

    }
    /** @return list<\Carbon\CarbonImmutable> */
    public static function eachDay ( \Carbon\CarbonInterface $start, \Carbon\CarbonInterface $end ): array {

        return Range::eachDay($start, $end);

    }

}
