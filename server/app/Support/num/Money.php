<?php

declare(strict_types=1);

namespace App\Support\Num;

class Money {

    public static function add ( int $a, int $b ): int {

        return $a + $b;

    }
    public static function subtract ( int $a, int $b ): int {

        return $a - $b;

    }
    public static function multiply ( int $amount, int $quantity ): int {

        return $amount * $quantity;

    }
    public static function fromDecimal ( string $value, int $scale = 2 ): int {

        $value = trim($value);
        $negative = str_starts_with($value, '-');

        [$whole, $fraction] = array_pad(explode('.', ltrim($value, '+-'), 2), 2, '');
        $whole = preg_replace('/\D/', '', $whole) ?: '0';
        $fraction = substr(str_pad(preg_replace('/\D/', '', $fraction) ?? '', $scale, '0'), 0, $scale);

        $minor = (int) $whole * self::factor($scale) + (int) $fraction;

        return $negative ? -$minor : $minor;

    }
    public static function toDecimal ( int $minor, int $scale = 2 ): string {

        $factor = self::factor($scale);
        $negative = $minor < 0;
        $minor = abs($minor);

        $whole = (string) intdiv($minor, $factor);
        $result = $scale > 0 ? $whole . '.' . str_pad((string) ($minor % $factor), $scale, '0', STR_PAD_LEFT) : $whole;

        return $negative ? '-' . $result : $result;

    }
    /** @return list<int> */
    public static function allocate ( int $amount, array $ratios ): array {

        $total = array_sum($ratios);
        if ( $total <= 0 || $ratios === [] ) return array_fill(0, count($ratios), 0);

        $shares = [];
        $remainder = $amount;

        foreach ( $ratios as $ratio ) {

            $share = intdiv($amount * $ratio, $total);
            $shares[] = $share;
            $remainder -= $share;

        }

        $step = $remainder <=> 0;
        $count = count($shares);

        for ( $i = 0; $remainder !== 0; $i++ ) {

            $shares[$i % $count] += $step;
            $remainder -= $step;

        }

        return array_values($shares);

    }
    /** @return list<int> */
    public static function split ( int $amount, int $parts ): array {

        if ( $parts < 1 ) return [];

        return self::allocate($amount, array_fill(0, $parts, 1));

    }
    private static function factor ( int $scale ): int {

        return (int) (10 ** max($scale, 0));

    }

}
