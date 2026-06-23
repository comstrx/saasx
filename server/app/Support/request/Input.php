<?php

declare(strict_types=1);

namespace App\Support\Request;
use App\Support\Cast;

class Input {

    public static function get ( string $key, mixed $default = null ): mixed {

        return \Illuminate\Support\Facades\Request::input($key, $default);

    }
    public static function string ( string $key ): ?string {

        return Cast::string(self::get($key));

    }
    public static function integer ( string $key ): ?int {

        return Cast::integer(self::get($key));

    }
    public static function float ( string $key ): ?float {

        return Cast::float(self::get($key));

    }
    public static function boolean ( string $key ): bool {

        return Cast::boolean(self::get($key));

    }
    /** @return array<mixed> */
    public static function array ( string $key ): array {

        return Cast::array(self::get($key));

    }
    /** @return array<mixed> */
    public static function all (): array {

        return \Illuminate\Support\Facades\Request::all();

    }

}
