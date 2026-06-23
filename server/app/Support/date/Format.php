<?php

declare(strict_types=1);

namespace App\Support\Date;

class Format {

    public static function iso ( \Carbon\CarbonInterface $date ): string {

        return $date->toIso8601String();

    }
    public static function custom ( \Carbon\CarbonInterface $date, string $format ): string {

        return $date->format($format);

    }
    public static function human ( \Carbon\CarbonInterface $date ): string {

        return $date->diffForHumans();

    }

}
