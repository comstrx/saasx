<?php

declare(strict_types=1);

namespace App\Support\Num;

class Percent {

    public static function ofBps ( int $amount, int $bps ): int {

        return intdiv($amount * $bps, 10000);

    }
    public static function ratio ( int $part, int $whole ): float {

        return $whole === 0 ? 0.0 : $part / $whole;

    }

}
