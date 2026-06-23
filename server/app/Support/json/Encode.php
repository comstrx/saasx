<?php

declare(strict_types=1);

namespace App\Support\Json;

class Encode {

    public static function encode ( mixed $value, bool $pretty = false ): string {

        $flags = JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE;

        return json_encode($value, $pretty ? $flags | JSON_PRETTY_PRINT : $flags);

    }

}
