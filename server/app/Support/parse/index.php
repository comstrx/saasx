<?php

declare(strict_types=1);

namespace App\Support;
use App\Support\Parse\Csv;
use App\Support\Parse\Query;
use App\Support\Parse\Boolean;
use App\Support\Parse\Number;
use App\Support\Parse\Locale;

class Parse {

    /** @return list<list<string>> */
    public static function csv ( string $content, string $delimiter = ',' ): array {

        return Csv::rows($content, $delimiter);

    }
    /** @return list<array<string, string>> */
    public static function csvWithHeaders ( string $content, string $delimiter = ',' ): array {

        return Csv::withHeaders($content, $delimiter);

    }
    /** @return array<int|string, mixed> */
    public static function query ( string $query ): array {

        return Query::parse($query);

    }
    /** @return list<string> */
    public static function items ( string $value, string $separator = ',' ): array {

        return Query::items($value, $separator);

    }
    public static function boolean ( mixed $value ): bool {

        return Boolean::parse($value);

    }
    public static function nullableBoolean ( mixed $value ): ?bool {

        return Boolean::nullable($value);

    }
    public static function integer ( mixed $value ): ?int {

        return Number::integer($value);

    }
    public static function float ( mixed $value ): ?float {

        return Number::float($value);

    }
    public static function locale ( string $value, array $supported, string $fallback = 'en' ): string {

        return Locale::normalize($value, $supported, $fallback);

    }

}
