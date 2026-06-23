<?php

declare(strict_types=1);

namespace App\Support\Num;

class Format {

    public static function thousands ( int|float $value, int $decimals = 0, string $point = '.', string $separator = ',' ): string {

        return number_format($value, $decimals, $point, $separator);

    }

}
