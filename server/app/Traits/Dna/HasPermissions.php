<?php

declare(strict_types=1);

namespace App\Traits\Dna;
use App\Enums\Authority;
use App\Models\Permission;
use App\Models\PermissionSetting;
use App\Support\Arr;
use App\Support\Context;
use App\Support\Response;
use App\Support\Str;
use App\Traits\Dna\Permissions\Resolver;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Exceptions\HttpResponseException;

/** @mixin \Illuminate\Database\Eloquent\Model */
trait HasPermissions {

    public function can ( string $key, ?Model $item = null ): bool {

        return $this->setting($key, $item)['allow'];

    }
    /** @return array{allow: bool, locked: bool, source: string} */
    public function setting ( string $key, ?Model $item = null ): array {

        $target = $this->permissionTarget($item);

        return Resolver::resolve(Context::tenantId(), $key, Context::role(), $target?->getMorphClass(), $target === null ? null : (string) $target->getKey(), Context::userId());

    }
    /** @return array<string, array{allow: bool, locked: bool, source: string}> */
    public function settings ( string $scope ): array {

        $target = $this->permissionTarget(null);

        return Resolver::matrix($scope, Context::tenantId(), Context::role(), $target?->getMorphClass(), $target === null ? null : (string) $target->getKey(), Context::userId());

    }
    public function hasOrFail ( string $key, ?Model $item = null ): static {

        if ( ! $this->can($key, $item) ) throw new HttpResponseException(Response::error('permission', 'This action is unauthorized.', 403));

        return $this;

    }
    public function grant ( string $key, string $scope, mixed $ref = null, bool $lock = false ): static {

        return $this->write($key, $scope, true, $lock, Authority::Tenant, $ref);

    }
    public function revoke ( string $key, string $scope, mixed $ref = null, bool $lock = false ): static {

        return $this->write($key, $scope, false, $lock, Authority::Tenant, $ref);

    }
    public function force ( string $key, string $scope, bool $allow, bool $lock = true ): static {

        if ( ! Context::isSuper() ) throw new \RuntimeException('Forcing a permission requires a super context.');

        return $this->write($key, $scope, $allow, $lock, Authority::Super, null);

    }
    protected function write ( string $key, string $scope, bool $allow, bool $lock, Authority $authority, mixed $ref ): static {

        $permissionId = $this->permissionId($key);

        if ( $permissionId === null ) throw new \RuntimeException('Unknown permission: ' . $key);

        if ( $authority === Authority::Tenant ) {

            if ( ! self::tenantWritableScope($scope) ) throw new \RuntimeException('A tenant may only write tenant, entity, or item scopes: ' . $scope);

            $current = $this->setting($key);

            if ( $current['locked'] && Str::startsWith($current['source'], 'super') ) throw new \RuntimeException('Permission is locked by a higher authority: ' . $key);

        }

        $row = $this->permissionRow($permissionId, $scope, $allow, $lock, $authority, $ref);

        PermissionSetting::query()->withoutGlobalScope('tenant')->updateOrCreate(
            Arr::only($row, ['tenant_id', 'permission_id', 'scope', 'role', 'target_type', 'target_id', 'user_id']),
            Arr::only($row, ['allow', 'locked', 'authority']),
        );

        $scope === 'global' ? Resolver::forgetAll() : Resolver::forget(self::nullableString($row['tenant_id'] ?? null));

        return $this;

    }
    /** @return array<string, mixed> */
    protected function permissionRow ( string $permissionId, string $scope, bool $allow, bool $lock, Authority $authority, mixed $ref ): array {

        $base = [
            'permission_id' => $permissionId,
            'scope'         => $scope,
            'authority'     => $authority->value,
            'tenant_id'     => $scope === 'global' ? null : ( self::nullableString($this->getAttribute('tenant_id')) ?? Context::tenantId() ),
            'role'          => null,
            'target_type'   => null,
            'target_id'     => null,
            'user_id'       => null,
            'allow'         => $allow,
            'locked'        => $lock,
        ];

        return match ( $scope ) {
            'entity' => is_string($ref) ? [...$base, 'role' => $ref] : [...$base, 'target_type' => $this->getMorphClass()],
            'item'   => [...$base, 'target_type' => $this->getMorphClass(), 'target_id' => (string) $this->getKey(), 'user_id' => $ref === null ? null : (string) $ref],
            default  => $base,
        };

    }
    protected function permissionTarget ( ?Model $item ): ?Model {

        if ( $item !== null ) return $item;

        return $this->isPermissionActor() ? null : $this;

    }
    protected function isPermissionActor (): bool {

        return Context::userId() !== null && (string) $this->getKey() === Context::userId();

    }
    protected function permissionId ( string $key ): ?string {

        $permission = Permission::query()->where('key', $key)->first();

        return $permission === null ? null : (string) $permission->getKey();

    }
    protected static function tenantWritableScope ( string $scope ): bool {

        return match ( $scope ) {
            'tenant', 'entity', 'item' => true,
            default                    => false,
        };

    }
    protected static function nullableString ( mixed $value ): ?string {

        return $value === null ? null : (string) $value;

    }

}
