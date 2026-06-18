<?php

declare(strict_types=1);

namespace App\Support\Response;

class Envelope {

    /** @return array<string, mixed> */
    public static function success ( mixed $data = null, array $extra = [] ): array {

        return ['status' => true, 'data' => $data] + $extra;

    }
    /** @return array<string, mixed> */
    public static function fail ( array $errors = [], ?string $message = null ): array {

        return ['status' => false, 'message' => $message ?? 'request failed', 'errors' => $errors];

    }

}
