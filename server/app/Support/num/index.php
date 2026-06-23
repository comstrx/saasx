<?php

declare(strict_types=1);

namespace App\Support;
use App\Support\Num\Money;
use App\Support\Num\Percent;
use App\Support\Num\Range;
use App\Support\Num\Format;
use App\Support\Num\Random;

class Num {

    public static function add ( int $a, int $b ): int {

        return Money::add($a, $b);

    }
    public static function subtract ( int $a, int $b ): int {

        return Money::subtract($a, $b);

    }
    public static function multiply ( int $amount, int $quantity ): int {

        return Money::multiply($amount, $quantity);

    }
    public static function fromDecimal ( string $value, int $scale = 2 ): int {

        return Money::fromDecimal($value, $scale);

    }
    public static function toDecimal ( int $minor, int $scale = 2 ): string {

        return Money::toDecimal($minor, $scale);

    }
    /** @return list<int> */
    public static function allocate ( int $amount, array $ratios ): array {

        return Money::allocate($amount, $ratios);

    }
    /** @return list<int> */
    public static function split ( int $amount, int $parts ): array {

        return Money::split($amount, $parts);

    }
    public static function percent ( int $amount, int $bps ): int {

        return Percent::ofBps($amount, $bps);

    }
    public static function ratio ( int $part, int $whole ): float {

        return Percent::ratio($part, $whole);

    }
    public static function clamp ( int|float $value, int|float $min, int|float $max ): int|float {

        return Range::clamp($value, $min, $max);

    }
    public static function between ( int|float $value, int|float $min, int|float $max ): bool {

        return Range::between($value, $min, $max);

    }
    public static function wrap ( int $value, int $min, int $max ): int {

        return Range::wrap($value, $min, $max);

    }
    public static function format ( int|float $value, int $decimals = 0, string $point = '.', string $separator = ',' ): string {

        return Format::thousands($value, $decimals, $point, $separator);

    }
    public static function random ( int $min, int $max ): int {

        return Random::between($min, $max);

    }

}
