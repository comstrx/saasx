<?php

declare(strict_types=1);

namespace App\Support\File;

class Size {

    private const UNITS = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];

    public static function human ( int $bytes, int $precision = 2 ): string {

        $bytes = max($bytes, 0);
        $power = $bytes > 0 ? (int) floor(log($bytes, 1024)) : 0;
        $power = min($power, count(self::UNITS) - 1);

        return round($bytes / (1024 ** $power), $precision) . ' ' . self::UNITS[$power];

    }
    public static function toBytes ( string $value ): int {

        if ( ! preg_match('/^\s*([0-9.]+)\s*([a-z]*)\s*$/i', $value, $match) ) return 0;

        $power = array_search(strtoupper($match[2] ?: 'B'), self::UNITS, true);

        return $power === false ? (int) (float) $match[1] : (int) ((float) $match[1] * (1024 ** $power));

    }

}
