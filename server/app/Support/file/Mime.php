<?php

declare(strict_types=1);

namespace App\Support\File;

class Mime {

    private const MAP = [
        'jpg'  => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'png'  => 'image/png',
        'gif'  => 'image/gif',
        'webp' => 'image/webp',
        'svg'  => 'image/svg+xml',
        'pdf'  => 'application/pdf',
        'json' => 'application/json',
        'csv'  => 'text/csv',
        'txt'  => 'text/plain',
        'zip'  => 'application/zip',
        'mp4'  => 'video/mp4',
    ];

    public static function fromPath ( string $path ): ?string {

        if ( ! is_file($path) ) return null;

        $info = finfo_open(FILEINFO_MIME_TYPE);
        if ( $info === false ) return null;

        $mime = finfo_file($info, $path);
        finfo_close($info);

        return $mime === false ? null : $mime;

    }
    public static function fromExtension ( string $extension ): ?string {

        return self::MAP[strtolower(ltrim($extension, '.'))] ?? null;

    }

}
