<?php

declare(strict_types=1);

namespace App\Support\Num;

class Range {

    public static function clamp ( int|float $value, int|float $min, int|float $max ): int|float {

        return max($min, min($max, $value));

    }
    public static function between ( int|float $value, int|float $min, int|float $max ): bool {

        return $value >= $min && $value <= $max;

    }
    public static function wrap ( int $value, int $min, int $max ): int {

        $span = $max - $min + 1;
        if ( $span < 1 ) return $value;

        return $min + (($value - $min) % $span + $span) % $span;

    }

}
