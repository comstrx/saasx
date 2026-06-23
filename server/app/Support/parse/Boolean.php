<?php

declare(strict_types=1);

namespace App\Support\Parse;

use App\Support\Cast;

class Boolean {

    public static function parse ( mixed $value ): bool {

        return Cast::boolean($value);

    }
    public static function nullable ( mixed $value ): ?bool {

        if ( $value === null || $value === '' ) return null;

        return Cast::boolean($value);

    }

}
