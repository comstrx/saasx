<?php

namespace App\Traits\Model\Permissions;
use App\Models\SpecialPermission;
use App\Models\Permission;
use App\Models\Entity;

trait General {

    use Helpers, Sync;

    public static function allEntityPermissions () {

        return (new static)->rememberPermissions("entity", function () {
            
            return static::getEntityPermissions()->pluck('name')->all();

        });
       
    }
    public static function allowedEntityPermissions () {

        return (new static)->rememberPermissions("entity_allowed", function () {

            return static::getEntityPermissions()->where('allow', true)->pluck('name')->all();

        });
    
    }
    public static function deniedEntityPermissions () {

        return (new static)->rememberPermissions("entity_denied", function () {

            return static::getEntityPermissions()->where('allow', false)->pluck('name')->all();

        });
    
    }
    public static function entityPermissionsResource () {

        return (new static)->rememberPermissions("entity_resource", function () {

            [$all, $allowed, $denied] = [
                static::allEntityPermissions(),
                static::allowedEntityPermissions(),
                static::deniedEntityPermissions()
            ];
        
            $permissions = collect($all)->mapWithKeys(fn($perm) => [$perm => collect($allowed)->contains($perm)])->all();

            return ['all' => $all, 'allowed' => $allowed, 'denied' => $denied, 'permissions' => $permissions];

        });

    }
    public static function resetEntityPermissions ( bool $force = false ) {

        return static::syncPermissions(name: (new static)->entityName(), force: $force);

    }

    public static function createPermission ( string|array $name, bool $allow = true, array $conditions = [] ) {

        $entity = (new static)->entity();

        $permissions = collect((array) $name)->map(fn($name) =>
            Permission::updateOrCreate(['entity_id' => $entity->id, 'name' => $name, ...$conditions], ['allow' => $allow])
        );

        static::forgetEntityPermissions(attributes: $conditions);
        return is_array($name) ? $permissions->values() : $permissions->first();

    }
    public static function dropPermission ( string|array $name, array $conditions = [] ) {

        $entity = (new static)->entity();

        collect((array) $name)->map(fn($name) =>
            Permission::where(['entity_id' => $entity->id, 'name' => $name, ...$conditions])->delete()
        );

        return static::forgetEntityPermissions(attributes: $conditions);

    }
    public static function assignPermission ( string|array $name, bool $allow = true, bool $force = false, array $conditions = [] ) {

        $permissions = static::getEntityPermissions()
            ->whereIn('name', (array) $name)
            ->when(!empty($conditions), fn($q) => $q->where($conditions))
            ->get();

        $permissions->each(fn($permission) => $permission->update(['allow' => $allow]));

        if ( $force ) {

            SpecialPermission::where('related_type', static::class)
                ->whereIn('permission_id', $permissions->pluck('id'))
                ->when(!empty($conditions), fn($q) => $q->where($conditions))
                ->update(['allow' => $allow]);

        }

        return static::forgetEntityPermissions(attributes: $conditions);
        
    }
    public static function allowPermission ( ...$names ) {

        return static::assignPermission($names, true);

    }
    public static function denyPermission ( ...$names ) {

        return static::assignPermission($names, false);
        
    }

    public static function hasAllPermissions ( ...$names ) {

        return collect((new static)->resolveNames($names))
            ->every(fn($name) => collect((new static)->resolveNames(static::allowedEntityPermissions()))->contains($name));

    }
    public static function hasAnyPermission ( ...$names ) {

        return collect((new static)->resolveNames(static::allowedEntityPermissions()))
            ->intersect((new static)->resolveNames($names))->isNotEmpty();

    }
    public static function hasPermission ( ...$names ) {

        return static::hasAllPermissions(...$names);

    }
    public static function notHasAllPermissions ( ...$names ) {

        return !static::hasAllPermissions(...$names);

    }
    public static function notHasAnyPermission ( ...$names ) {

        return !static::hasAnyPermission(...$names);

    }
    public static function notHasPermission ( ...$names ) {

        return !static::hasAnyPermission(...$names);

    }

    public static function hasAllPermissionsOrFail ( ...$names ) {

        return static::hasAllPermissions(...$names) ?: (new static)->failPermissionNow();

    }
    public static function hasAnyPermissionOrFail ( ...$names ) {

        return static::hasAnyPermission(...$names) ?: (new static)->failPermissionNow();

    }
    public static function hasPermissionOrFail ( ...$names ) {

        return static::hasPermission(...$names) ?: (new static)->failPermissionNow();

    }
    public static function notHasAllPermissionsOrFail ( ...$names ) {

        return static::notHasAllPermissions(...$names) ?: (new static)->failPermissionNow();

    }
    public static function notHasAnyPermissionOrFail ( ...$names ) {

        return static::notHasAnyPermission(...$names) ?: (new static)->failPermissionNow();

    }
    public static function notHasPermissionOrFail ( ...$names ) {

        return static::notHasPermission(...$names) ?: (new static)->failPermissionNow();

    }

}
