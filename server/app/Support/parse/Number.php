<?php

declare(strict_types=1);

namespace App\Support\Parse;

use App\Support\Cast;

class Number {

    public static function integer ( mixed $value ): ?int {

        return Cast::integer($value);

    }
    public static function float ( mixed $value ): ?float {

        return Cast::float($value);

    }

}
