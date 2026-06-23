<?php

declare(strict_types=1);

namespace App\Support\Request;
use App\Support\Parse;

class Locale {

    public static function get (): string {

        return Parse::locale(self::preferred(), self::supported(), self::fallback());

    }
    protected static function preferred (): string {

        $locale = Header::get('Locale');

        if ( $locale !== null && $locale !== '' ) return $locale;

        return Header::get('Accept-Language') ?? self::fallback();

    }
    /** @return list<string> */
    protected static function supported (): array {

        $configured = config('app.locales');
        $list = is_array($configured) ? $configured : [config('app.locale'), self::fallback()];

        $values = array_values(array_unique(array_filter(
            array_map(static fn ( mixed $value ): string => is_string($value) ? $value : '', $list),
            static fn ( string $value ): bool => $value !== '',
        )));

        return $values === [] ? [self::fallback()] : $values;

    }
    protected static function fallback (): string {

        $fallback = config('app.fallback_locale', 'en');

        return is_string($fallback) ? $fallback : 'en';

    }

}
