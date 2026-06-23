<?php

declare(strict_types=1);

namespace App\Support\Json;

class Merge {

    /** @return array<mixed> */
    public static function deep ( array $base, array $overrides ): array {

        foreach ( $overrides as $key => $value ) {

            if ( is_array($value) && isset($base[$key]) && is_array($base[$key]) ) {

                $base[$key] = self::deep($base[$key], $value);

                continue;

            }

            $base[$key] = $value;

        }

        return $base;

    }

}
