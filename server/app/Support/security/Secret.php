<?php

declare(strict_types=1);

namespace App\Support\Security;

class Secret {

    public static function equals ( string $known, string $given ): bool {

        return hash_equals($known, $given);

    }
    public static function present ( ?string $value ): bool {

        return $value !== null && trim($value) !== '';

    }

}
