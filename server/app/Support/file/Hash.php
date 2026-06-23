<?php

declare(strict_types=1);

namespace App\Support\File;

class Hash {

    public static function file ( string $path, string $algo = 'sha256' ): ?string {

        if ( ! is_file($path) ) return null;

        $hash = hash_file($algo, $path);

        return $hash === false ? null : $hash;

    }
    public static function contents ( string $contents, string $algo = 'sha256' ): string {

        return hash($algo, $contents);

    }

}
