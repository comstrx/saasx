<?php

declare(strict_types=1);

namespace App\Support\Validate;

use App\Support\Str;

class Field {

    public static function isUuid7 ( string $value ): bool {

        return preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i', $value) === 1;

    }
    public static function isSlug ( string $value, string $separator = '-' ): bool {

        return $value !== '' && Str::slug($value, $separator) === $value;

    }
    public static function isEmail ( string $value ): bool {

        return filter_var($value, FILTER_VALIDATE_EMAIL) !== false;

    }
    public static function isUrl ( string $value ): bool {

        return filter_var($value, FILTER_VALIDATE_URL) !== false;

    }

}
