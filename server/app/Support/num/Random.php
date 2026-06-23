<?php

declare(strict_types=1);

namespace App\Support\Num;

class Random {

    public static function between ( int $min, int $max ): int {

        return $min <= $max ? random_int($min, $max) : random_int($max, $min);

    }

}
