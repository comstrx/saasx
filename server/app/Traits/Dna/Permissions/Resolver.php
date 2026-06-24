<?php

declare(strict_types=1);

namespace App\Traits\Dna\Permissions;
use App\Enums\PermissionScope;
use App\Models\Permission;
use App\Models\PermissionSetting;
use App\Support\Cache;
use Illuminate\Database\Eloquent\Builder;

/**
 * @phpstan-type Setting array{scope: string, authority: string, role: string|null, target_type: string|null, target_id: string|null, user_id: string|null, allow: bool, locked: bool, tenant_id: string|null}
 */
class Resolver {

    private const TTL = 600;

    /** @var array{allow: bool, locked: bool, source: string} */
    private const DENY = ['allow' => false, 'locked' => false, 'source' => 'deny'];

    /** @return array{allow: bool, locked: bool, source: string} */
    public static function resolve ( ?string $tenantId, string $permissionKey, ?string $role = null, ?string $targetType = null, ?string $targetId = null, ?string $userId = null ): array {

        $permission = self::permission($permissionKey);

        if ( $permission === null ) return self::DENY;

        return self::cascade(self::settings($tenantId, $permission['id']), $tenantId, $role, $targetType, $targetId, $userId, $permission['default']);

    }
    public static function allows ( ?string $tenantId, string $permissionKey, ?string $role = null, ?string $targetType = null, ?string $targetId = null, ?string $userId = null ): bool {

        return self::resolve($tenantId, $permissionKey, $role, $targetType, $targetId, $userId)['allow'];

    }
    /** @return array<string, array{allow: bool, locked: bool, source: string}> */
    public static function matrix ( string $scope, ?string $tenantId, ?string $role = null, ?string $targetType = null, ?string $targetId = null, ?string $userId = null ): array {

        $result = [];

        foreach ( self::catalog() as $key ) {

            $result[$key] = self::resolve($tenantId, $key, $role, $targetType, $targetId, $userId);

        }

        return $result;

    }
    public static function forget ( ?string $tenantId ): void {

        Cache::resetShared('rbac:' . ( $tenantId ?? 'platform' ));

    }
    public static function forgetAll (): void {

        Cache::resetShared('rbac:all');

    }
    /** @return array{id: string, default: bool}|null */
    protected static function permission ( string $key ): ?array {

        return Cache::rememberShared('rbac:catalog:' . $key, self::TTL, static function () use ( $key ): ?array {

            $permission = Permission::query()->where('key', $key)->first();

            return $permission === null ? null : ['id' => (string) $permission->getKey(), 'default' => (bool) $permission->getAttribute('default')];

        }, ['rbac:catalog', 'rbac:all']);

    }
    /** @return list<string> */
    protected static function catalog (): array {

        return Cache::rememberShared('rbac:catalog:keys', self::TTL, static function (): array {

            $keys = [];

            foreach ( Permission::query()->get() as $permission ) $keys[] = (string) $permission->getAttribute('key');

            return $keys;

        }, ['rbac:catalog', 'rbac:all']);

    }
    /** @return list<Setting> */
    protected static function settings ( ?string $tenantId, string $permissionId ): array {

        return Cache::rememberShared('rbac:set:' . ( $tenantId ?? 'platform' ) . ':' . $permissionId, self::TTL, static fn (): array => self::load($tenantId, $permissionId), ['rbac:' . ( $tenantId ?? 'platform' ), 'rbac:all']);

    }
    /** @return list<Setting> */
    protected static function load ( ?string $tenantId, string $permissionId ): array {

        $rows = PermissionSetting::query()->withoutGlobalScope('tenant')
            ->where('permission_id', $permissionId)
            ->where(function ( Builder $query ) use ( $tenantId ): void {

                $query->where('tenant_id', $tenantId)->orWhere('scope', PermissionScope::Global->value);

            })
            ->get();

        $result = [];

        foreach ( $rows as $row ) {

            $result[] = [
                'scope'       => (string) $row->getRawOriginal('scope'),
                'authority'   => (string) $row->getRawOriginal('authority'),
                'role'        => self::nullableString($row->getRawOriginal('role')),
                'target_type' => self::nullableString($row->getRawOriginal('target_type')),
                'target_id'   => self::nullableString($row->getRawOriginal('target_id')),
                'user_id'     => self::nullableString($row->getRawOriginal('user_id')),
                'allow'       => (bool) $row->getRawOriginal('allow'),
                'locked'      => (bool) $row->getRawOriginal('locked'),
                'tenant_id'   => self::nullableString($row->getRawOriginal('tenant_id')),
            ];

        }

        return $result;

    }
    /**
     * @param  list<Setting> $settings
     * @return array{allow: bool, locked: bool, source: string}
     */
    protected static function cascade ( array $settings, ?string $tenantId, ?string $role, ?string $targetType, ?string $targetId, ?string $userId, bool $default ): array {

        $matched = [];

        foreach ( $settings as $row ) {

            if ( self::matches($row, $tenantId, $role, $targetType, $targetId, $userId) ) $matched[] = $row;

        }

        $locked = self::pickLocked($matched);

        if ( $locked !== null ) return self::verdict($locked, true);

        $allow = self::pickAllow($matched);

        if ( $allow !== null ) return self::verdict($allow, false);

        return $default ? ['allow' => true, 'locked' => false, 'source' => 'catalog'] : self::DENY;

    }
    /** @param Setting $row */
    protected static function matches ( array $row, ?string $tenantId, ?string $role, ?string $targetType, ?string $targetId, ?string $userId ): bool {

        if ( $row['scope'] !== 'global' && $row['tenant_id'] === null ) return false;

        return match ( $row['scope'] ) {
            'global' => true,
            'tenant' => $row['tenant_id'] === $tenantId,
            'entity' => $row['tenant_id'] === $tenantId && ( ( $row['role'] !== null && $row['role'] === $role ) || ( $row['target_type'] !== null && $row['target_type'] === $targetType ) ),
            'item'   => $row['tenant_id'] === $tenantId && $row['target_type'] === $targetType && $row['target_id'] === $targetId && ( $row['user_id'] === null || $row['user_id'] === $userId ),
            default  => false,
        };

    }
    /**
     * @param  list<Setting> $matched
     * @return Setting|null
     */
    protected static function pickLocked ( array $matched ): ?array {

        $best = null;

        foreach ( $matched as $row ) {

            if ( ! $row['locked'] ) continue;

            if ( $best === null || self::lockedKey($row) < self::lockedKey($best) ) $best = $row;

        }

        return $best;

    }
    /**
     * @param  list<Setting> $matched
     * @return Setting|null
     */
    protected static function pickAllow ( array $matched ): ?array {

        $best = null;

        foreach ( $matched as $row ) {

            if ( $row['locked'] ) continue;

            if ( $best === null || self::allowKey($row) < self::allowKey($best) ) $best = $row;

        }

        return $best;

    }
    /** @param Setting $row */
    protected static function lockedKey ( array $row ): string {

        return self::scopeOrder($row['scope']) . ( $row['authority'] === 'super' ? '0' : '1' );

    }
    /** @param Setting $row */
    protected static function allowKey ( array $row ): string {

        return self::specificity($row) . ( $row['authority'] === 'tenant' ? '0' : '1' );

    }
    protected static function scopeOrder ( string $scope ): string {

        return match ( $scope ) {
            'global' => '0',
            'tenant' => '1',
            'entity' => '2',
            'item'   => '3',
            default  => '9',
        };

    }
    /** @param Setting $row */
    protected static function specificity ( array $row ): string {

        return match ( $row['scope'] ) {
            'item'   => $row['user_id'] !== null ? '0' : '1',
            'entity' => '2',
            'tenant' => '3',
            'global' => '4',
            default  => '9',
        };

    }
    /**
     * @param  Setting $row
     * @return array{allow: bool, locked: bool, source: string}
     */
    protected static function verdict ( array $row, bool $locked ): array {

        return ['allow' => $row['allow'], 'locked' => $locked, 'source' => $row['authority'] . ':' . $row['scope']];

    }
    protected static function nullableString ( mixed $value ): ?string {

        return $value === null ? null : (string) $value;

    }

}
