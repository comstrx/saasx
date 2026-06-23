<?php

declare(strict_types=1);

namespace App\Support\Log;

class Context {

    /** @return array<string, mixed> */
    public static function merge ( array ...$contexts ): array {

        return array_merge([], ...$contexts);

    }

}
