<?php

declare(strict_types=1);

namespace App\Support\Response;

class Envelope {

    /** @return array<string, mixed> */
    public static function success ( mixed $data, array $extra = [] ): array {

        return array_merge(['status' => true, 'data' => $data], $extra);

    }
    /** @return array<string, mixed> */
    public static function message ( string $text ): array {

        return ['status' => true, 'message' => $text];

    }

}
