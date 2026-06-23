<?php

declare(strict_types=1);

namespace App\Support\Response;

class Meta {

    /** @return array<string, mixed> */
    public static function merge ( array $base, array $extra ): array {

        return array_merge($base, $extra);

    }

}
