<?php

declare(strict_types=1);

namespace App\Support\Security;

class Sanitize {

    public static function text ( string $value ): string {

        return trim(strip_tags($value));

    }
    public static function html ( string $value ): string {

        return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');

    }

}
