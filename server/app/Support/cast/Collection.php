<?php

declare(strict_types=1);

namespace App\Support\Cast;

class Collection {

    /** @return array<mixed> */
    public static function array ( mixed $value ): array {

        if ( is_array($value) ) return $value;

        if ( $value === null ) return [];

        return [$value];

    }
    /** @return list<mixed> */
    public static function values ( mixed $value ): array {

        return array_values(self::array($value));

    }

}
