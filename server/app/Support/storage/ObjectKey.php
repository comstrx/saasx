<?php

declare(strict_types=1);

namespace App\Support\Storage;
use App\Support\Context;
use App\Support\File;

class ObjectKey {

    public static function for ( string $path ): string {

        return self::prefix() . self::clean($path);

    }
    public static function in ( ?string $dir, string $name ): string {

        $segment = $dir === null || $dir === '' ? '' : self::clean($dir) . '/';

        return self::prefix() . $segment . self::clean($name);

    }
    protected static function prefix (): string {

        return 'tenants/' . (Context::tenantId() ?? 'platform') . '/';

    }
    protected static function clean ( string $path ): string {

        return ltrim(File::normalize($path), '/');

    }

}
