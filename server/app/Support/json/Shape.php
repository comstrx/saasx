<?php

declare(strict_types=1);

namespace App\Support\Json;

use App\Support\Arr;

class Shape {

    /** @return array<mixed> */
    public static function only ( string $json, array $keys ): array {

        return Arr::only(Decode::toArray($json), $keys);

    }
    /** @return array<mixed> */
    public static function except ( string $json, array $keys ): array {

        return Arr::except(Decode::toArray($json), $keys);

    }

}
