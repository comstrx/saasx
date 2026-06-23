<?php

declare(strict_types=1);

namespace App\Support\Validate;

class Type {

    public static function isString ( mixed $value ): bool {

        return is_string($value);

    }
    public static function isInt ( mixed $value ): bool {

        return is_int($value);

    }
    public static function isFloat ( mixed $value ): bool {

        return is_float($value) || is_int($value);

    }
    public static function isBool ( mixed $value ): bool {

        return is_bool($value);

    }
    public static function isArray ( mixed $value ): bool {

        return is_array($value);

    }

}
