<?php

declare(strict_types=1);

namespace App\Support\Response;

class Failure {

    /** @return array<string, mixed> */
    public static function make ( array $errors = [], ?string $message = null ): array {

        return ['status' => false, 'message' => $message ?? 'Request failed.', 'errors' => $errors];

    }

}
