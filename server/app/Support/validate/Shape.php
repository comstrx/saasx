<?php

declare(strict_types=1);

namespace App\Support\Validate;

class Shape {

    /** @return array<string, mixed> */
    public static function validate ( array $data, array $rules ): array {

        return \Illuminate\Support\Facades\Validator::make($data, $rules)->validate();

    }
    public static function passes ( array $data, array $rules ): bool {

        return \Illuminate\Support\Facades\Validator::make($data, $rules)->passes();

    }

}
