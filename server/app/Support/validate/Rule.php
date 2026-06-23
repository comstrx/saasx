<?php

declare(strict_types=1);

namespace App\Support\Validate;

class Rule {

    public static function uuid7 (): \Closure {

        return static function ( string $attribute, mixed $value, \Closure $fail ): void {

            if ( ! is_string($value) || ! Field::isUuid7($value) ) $fail('The :attribute must be a valid UUID version 7.');

        };

    }
    public static function slug (): \Closure {

        return static function ( string $attribute, mixed $value, \Closure $fail ): void {

            if ( ! is_string($value) || ! Field::isSlug($value) ) $fail('The :attribute must be a valid slug.');

        };

    }

}
