<?php

declare(strict_types=1);

namespace App\Support\Cast;

class Enum {

    /**
     * @template T of \BackedEnum
     * @param  class-string<T> $enum
     * @return T|null
     */
    public static function enum ( string $enum, mixed $value ): ?\BackedEnum {

        if ( $value instanceof $enum ) return $value;

        if ( ! is_string($value) && ! is_int($value) ) return null;

        return $enum::tryFrom($value);

    }

}
