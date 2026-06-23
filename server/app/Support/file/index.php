<?php

declare(strict_types=1);

namespace App\Support;
use App\Support\File\Path;
use App\Support\File\Name;
use App\Support\File\Mime;
use App\Support\File\Size;
use App\Support\File\Hash;
use App\Support\File\Stream;

class File {

    public static function join ( string ...$parts ): string {

        return Path::join(...$parts);

    }
    public static function normalize ( string $path ): string {

        return Path::normalize($path);

    }
    public static function extension ( string $path ): string {

        return Path::extension($path);

    }
    public static function dirname ( string $path ): string {

        return Path::dirname($path);

    }
    public static function basename ( string $path ): string {

        return Path::basename($path);

    }
    public static function filename ( string $path ): string {

        return Path::filename($path);

    }
    public static function sanitize ( string $name ): string {

        return Name::sanitize($name);

    }
    public static function unique ( string $name, int $entropy = 8 ): string {

        return Name::unique($name, $entropy);

    }
    public static function mime ( string $path ): ?string {

        return Mime::fromPath($path);

    }
    public static function mimeFromExtension ( string $extension ): ?string {

        return Mime::fromExtension($extension);

    }
    public static function humanSize ( int $bytes, int $precision = 2 ): string {

        return Size::human($bytes, $precision);

    }
    public static function toBytes ( string $value ): int {

        return Size::toBytes($value);

    }
    public static function hash ( string $path, string $algo = 'sha256' ): ?string {

        return Hash::file($path, $algo);

    }
    public static function hashContents ( string $contents, string $algo = 'sha256' ): string {

        return Hash::contents($contents, $algo);

    }
    public static function read ( string $path ): ?string {

        return Stream::read($path);

    }
    public static function write ( string $path, string $contents ): bool {

        return Stream::write($path, $contents);

    }
    public static function append ( string $path, string $contents ): bool {

        return Stream::append($path, $contents);

    }
    public static function copy ( string $from, string $to ): bool {

        return Stream::copy($from, $to);

    }
    public static function delete ( string $path ): bool {

        return Stream::delete($path);

    }

}
