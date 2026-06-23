<?php

declare(strict_types=1);

namespace App\Support\File;

class Name {

    public static function sanitize ( string $name ): string {

        $name = str_replace(['/', '\\', "\0"], '', basename($name));
        $name = preg_replace('/[^\p{L}\p{N}._-]+/u', '_', $name) ?? '';

        return trim($name, '._-') ?: 'file';

    }
    public static function unique ( string $name, int $entropy = 8 ): string {

        $extension = Path::extension($name);
        $base = Path::filename(self::sanitize($name));
        $suffix = bin2hex(random_bytes(max($entropy, 1)));

        return $extension === '' ? "{$base}-{$suffix}" : "{$base}-{$suffix}.{$extension}";

    }

}
