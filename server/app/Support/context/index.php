<?php

declare(strict_types=1);

namespace App\Support;
use App\Support\Context\Panel;
use App\Support\Context\Scope;
use App\Support\Context\Tenant;
use App\Support\Context\User;
use App\Support\Context\Meta;

class Context {

    public static function tenantId (): ?string {

        return Tenant::id();

    }
    public static function role (): string {

        return Scope::role();

    }
    public static function panel (): string {

        return Panel::get();

    }
    public static function isSuper (): bool {

        return Scope::isSuper();

    }
    public static function userId (): ?string {

        return User::id();

    }
    public static function set ( string $panel, string $role, ?string $tenantId, ?string $userId ): void {

        Panel::set($panel);
        Scope::set($role);
        Tenant::set($tenantId);
        User::set($userId);

    }
    public static function forget (): void {

        \Illuminate\Support\Facades\Context::forget(Panel::KEY);
        \Illuminate\Support\Facades\Context::forget(Scope::KEY);
        \Illuminate\Support\Facades\Context::forget(Tenant::KEY);
        \Illuminate\Support\Facades\Context::forget(User::KEY);

    }
    public static function get ( string $key, mixed $default = null ): mixed {

        return Meta::get($key, $default);

    }
    public static function put ( string $key, mixed $value ): void {

        Meta::set($key, $value);

    }
    public static function has ( string $key ): bool {

        return Meta::has($key);

    }

}
