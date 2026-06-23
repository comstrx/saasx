<?php

declare(strict_types=1);

namespace App\Support;
use App\Support\Request\Input;
use App\Support\Request\Header;
use App\Support\Request\Fingerprint;
use App\Support\Request\Idempotency;
use App\Support\Request\Locale;
use App\Support\Request\Tenant;

class Request {

    public static function input ( string $key, mixed $default = null ): mixed {

        return Input::get($key, $default);

    }
    public static function string ( string $key ): ?string {

        return Input::string($key);

    }
    public static function integer ( string $key ): ?int {

        return Input::integer($key);

    }
    public static function float ( string $key ): ?float {

        return Input::float($key);

    }
    public static function boolean ( string $key ): bool {

        return Input::boolean($key);

    }
    /** @return array<mixed> */
    public static function array ( string $key ): array {

        return Input::array($key);

    }
    /** @return array<mixed> */
    public static function all (): array {

        return Input::all();

    }
    public static function header ( string $name, ?string $default = null ): ?string {

        return Header::get($name, $default);

    }
    public static function bearerToken (): ?string {

        return Header::bearerToken();

    }
    public static function fingerprint (): string {

        return Fingerprint::make();

    }
    public static function idempotencyKey (): ?string {

        return Idempotency::key();

    }
    public static function idempotencyScopedKey ( string $endpoint ): ?string {

        return Idempotency::scopedKey($endpoint);

    }
    public static function locale (): string {

        return Locale::get();

    }
    public static function tenantHint ( ?string $base = null ): ?string {

        return Tenant::hint($base);

    }

}
