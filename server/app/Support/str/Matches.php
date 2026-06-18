<?php

declare(strict_types=1);

namespace App\Support\Str;

class Matches {

    public static function contains ( string $haystack, string|array $needles ): bool {

        foreach ( (array) $needles as $needle ) {

            if ( $needle !== '' && str_contains($haystack, $needle) ) return true;

        }

        return false;

    }
    public static function containsAll ( string $haystack, array $needles ): bool {

        foreach ( $needles as $needle ) {

            if ( $needle === '' || ! str_contains($haystack, $needle) ) return false;

        }

        return $needles !== [];

    }
    public static function startsWith ( string $haystack, string|array $needles ): bool {

        foreach ( (array) $needles as $needle ) {

            if ( $needle !== '' && str_starts_with($haystack, $needle) ) return true;

        }

        return false;

    }
    public static function endsWith ( string $haystack, string|array $needles ): bool {

        foreach ( (array) $needles as $needle ) {

            if ( $needle !== '' && str_ends_with($haystack, $needle) ) return true;

        }

        return false;

    }
    public static function is ( string|array $pattern, string $value ): bool {

        foreach ( (array) $pattern as $item ) {

            if ( $item === $value ) return true;

            $regex = '#^' . str_replace('\*', '.*', preg_quote($item, '#')) . '$#u';

            if ( preg_match($regex, $value) === 1 ) return true;

        }

        return false;

    }
    public static function match ( string $pattern, string $value ): string {

        if ( @preg_match($pattern, $value, $matches) === false ) throw new \InvalidArgumentException("Invalid pattern: {$pattern}");

        return $matches[1] ?? $matches[0] ?? '';

    }
    /** @return list<string> */
    public static function matchAll ( string $pattern, string $value ): array {

        if ( @preg_match_all($pattern, $value, $matches) === false ) throw new \InvalidArgumentException("Invalid pattern: {$pattern}");

        return $matches[1] ?? $matches[0] ?? [];

    }
    public static function before ( string $subject, string $search ): string {

        if ( $search === '' ) return $subject;

        $position = mb_strpos($subject, $search);

        return $position === false ? $subject : mb_substr($subject, 0, $position);

    }
    public static function beforeLast ( string $subject, string $search ): string {

        if ( $search === '' ) return $subject;

        $position = mb_strrpos($subject, $search);

        return $position === false ? $subject : mb_substr($subject, 0, $position);

    }
    public static function after ( string $subject, string $search ): string {

        if ( $search === '' ) return $subject;

        $position = mb_strpos($subject, $search);

        return $position === false ? $subject : mb_substr($subject, $position + mb_strlen($search));

    }
    public static function afterLast ( string $subject, string $search ): string {

        if ( $search === '' ) return $subject;

        $position = mb_strrpos($subject, $search);

        return $position === false ? $subject : mb_substr($subject, $position + mb_strlen($search));

    }
    public static function between ( string $subject, string $from, string $to ): string {

        if ( $from === '' || $to === '' ) return $subject;

        return self::beforeLast(self::after($subject, $from), $to);

    }
    public static function length ( string $value ): int {

        return mb_strlen($value);

    }
    public static function wordCount ( string $value ): int {

        return count(Casing::words($value));

    }
    public static function isBlank ( string $value ): bool {

        return trim($value) === '';

    }

}
