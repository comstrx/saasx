<?php

declare(strict_types=1);

namespace App\Support\Str;

class Random {

    private const ALPHA = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    private const NUMERIC = '0123456789';

    public static function ofAlphabet ( int $length, string $alphabet ): string {

        $max = strlen($alphabet) - 1;
        if ( $length < 1 || $max < 0 ) return '';

        $output = '';

        for ( $i = 0; $i < $length; $i++ ) {

            $output .= $alphabet[random_int(0, $max)];

        }

        return $output;

    }
    public static function random ( int $length = 16 ): string {

        return self::ofAlphabet($length, self::ALPHA . self::NUMERIC);

    }
    public static function alpha ( int $length = 16 ): string {

        return self::ofAlphabet($length, self::ALPHA);

    }
    public static function numeric ( int $length = 6 ): string {

        return self::ofAlphabet($length, self::NUMERIC);

    }
    public static function secure ( int $bytes = 16 ): string {

        if ( $bytes < 1 ) return '';

        return bin2hex(random_bytes($bytes));

    }

}
