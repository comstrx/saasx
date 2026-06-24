<?php

declare(strict_types=1);

namespace App\Support;
use App\Support\Storage\Driver;
use App\Support\Storage\S3Driver;
use App\Support\Storage\ObjectKey;
use App\Support\Storage\Upload;
use App\Support\Storage\TemporaryUrl;

class Storage {

    protected static ?Driver $driver = null;

    /** @param array<string, mixed> $options */
    public static function put ( string $path, mixed $contents, array $options = [] ): string {

        $key = ObjectKey::for($path);

        self::driver()->put($key, $contents, $options);

        return $key;

    }
    public static function putFile ( \Illuminate\Http\UploadedFile $file, ?string $dir = null ): string {

        $key = Upload::key($file, $dir);

        self::driver()->put($key, $file);

        return $key;

    }
    public static function get ( string $key ): ?string {

        return self::driver()->get($key);

    }
    public static function exists ( string $key ): bool {

        return self::driver()->exists($key);

    }
    public static function delete ( string $key ): bool {

        return self::driver()->delete($key);

    }
    public static function temporaryUrl ( string $key, int $minutes = 5 ): string {

        return TemporaryUrl::for(self::driver(), $key, $minutes);

    }
    protected static function driver (): Driver {

        return self::$driver ??= new S3Driver();

    }

}
