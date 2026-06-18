<?php

declare(strict_types=1);

namespace App\Support\Str;

class Clean {

    public static function trim ( string $value, ?string $characters = null ): string {

        return $characters === null ? trim($value) : trim($value, $characters);

    }
    public static function squish ( string $value ): string {

        return trim(preg_replace('/\s+/u', ' ', $value) ?? '');

    }
    public static function ascii ( string $value ): string {

        if ( class_exists(\Normalizer::class) ) {

            $value = \Normalizer::normalize($value, \Normalizer::FORM_KD) ?: $value;

        }

        $value = preg_replace('/\pM+/u', '', $value) ?? $value;

        return preg_replace('/[^\x20-\x7E]/', '', $value) ?? '';

    }
    public static function stripTags ( string $value, ?string $allowed = null ): string {

        return $allowed === null ? strip_tags($value) : strip_tags($value, $allowed);

    }
    public static function digits ( string $value ): string {

        return preg_replace('/\D+/', '', $value) ?? '';

    }
    public static function alpha ( string $value ): string {

        return preg_replace('/[^\p{L}]+/u', '', $value) ?? '';

    }
    public static function alphanumeric ( string $value ): string {

        return preg_replace('/[^\p{L}\p{N}]+/u', '', $value) ?? '';

    }
    public static function limit ( string $value, int $limit = 100, string $end = '…' ): string {

        if ( mb_strlen($value) <= $limit ) return $value;

        return rtrim(mb_substr($value, 0, $limit)) . $end;

    }
    public static function limitWords ( string $value, int $words = 10, string $end = '…' ): string {

        $parts = preg_split('/\s+/u', trim($value)) ?: [];

        if ( count($parts) <= $words ) return implode(' ', $parts);

        return implode(' ', array_slice($parts, 0, $words)) . $end;

    }
    public static function mask ( string $value, string $character = '*', int $index = 0, ?int $length = null ): string {

        $total = mb_strlen($value);
        if ( $character === '' || $index >= $total ) return $value;

        $start = $index < 0 ? max($total + $index, 0) : $index;
        $count = max(min($length ?? $total - $start, $total - $start), 0);
        $masked = str_repeat(mb_substr($character, 0, 1), $count);

        return mb_substr($value, 0, $start) . $masked . mb_substr($value, $start + $count);

    }
    public static function start ( string $value, string $prefix ): string {

        return $prefix . (preg_replace('/^(?:' . preg_quote($prefix, '/') . ')+/u', '', $value) ?? $value);

    }
    public static function finish ( string $value, string $suffix ): string {

        return (preg_replace('/(?:' . preg_quote($suffix, '/') . ')+$/u', '', $value) ?? $value) . $suffix;

    }
    public static function replace ( string|array $search, string|array $replace, string $subject ): string {

        return str_replace($search, $replace, $subject);

    }
    public static function replaceFirst ( string $search, string $replace, string $subject ): string {

        if ( $search === '' ) return $subject;

        $position = strpos($subject, $search);

        return $position === false ? $subject : substr_replace($subject, $replace, $position, strlen($search));

    }
    public static function replaceLast ( string $search, string $replace, string $subject ): string {

        if ( $search === '' ) return $subject;

        $position = strrpos($subject, $search);

        return $position === false ? $subject : substr_replace($subject, $replace, $position, strlen($search));

    }
    public static function remove ( string|array $search, string $subject ): string {

        return str_replace($search, '', $subject);

    }

}
