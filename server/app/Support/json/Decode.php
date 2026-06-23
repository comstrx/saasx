<?php

declare(strict_types=1);

namespace App\Support\Json;

class Decode {

    public static function decode ( string $json ): mixed {

        return json_decode($json, true, 512, JSON_THROW_ON_ERROR);

    }
    /** @return array<mixed> */
    public static function toArray ( string $json ): array {

        $value = self::decode($json);

        return is_array($value) ? $value : [];

    }
    public static function valid ( string $json ): bool {

        return json_validate($json);

    }

}
