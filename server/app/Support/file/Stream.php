<?php

declare(strict_types=1);

namespace App\Support\File;

class Stream {

    public static function read ( string $path ): ?string {

        if ( ! is_file($path) || ! is_readable($path) ) return null;

        $contents = file_get_contents($path);

        return $contents === false ? null : $contents;

    }
    public static function write ( string $path, string $contents ): bool {

        return file_put_contents($path, $contents) !== false;

    }
    public static function append ( string $path, string $contents ): bool {

        return file_put_contents($path, $contents, FILE_APPEND) !== false;

    }
    public static function copy ( string $from, string $to ): bool {

        return is_file($from) && copy($from, $to);

    }
    public static function delete ( string $path ): bool {

        return ! is_file($path) || unlink($path);

    }

}
