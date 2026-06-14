<?php

namespace App\Traits\Model\Permissions;
use App\Models\Permission;
use App\Models\Entity;
use App\Models\SpecialPermission;

trait Sync {

    use Helpers;
    
    public static function resolveEntites ( string $configPath = null, string $name = null, bool $syncAll = false ) {

        $name   = $name ?? (new static)->entityName();
        $config = config($configPath, []);

        return $syncAll ? $config : (isset($config[$name]) ? [$name => $config[$name]] : []);

    }
    public static function resolvePermissions ( array $permissions = [] ) {

        return collect($permissions)->map(fn($perm, $key) =>
            match ( true ){
                is_array($perm) => [
                    'name' => is_string($key) ? string($key) : string($perm['name'] ?? null),
                    'description' => string($perm['description'] ?? null),
                    'group' => string($perm['group'] ?? null),
                    'allow' => bool($perm['default'] ?? true)
                ],
                is_string($key) => ['name' => $key, 'allow' => bool($perm ?? true)],
                default => ['name' => null, 'allow' => true],
            }
        )->filter(fn($perm) => $perm['name']);

    }
    public static function syncPermissions (
        string $configPath = null,
        string $name = null,
        array $conditions = [],
        bool $syncAll = false,
        bool $force = false ) {
        
        foreach ( static::resolveEntites($configPath, $name, $syncAll) as $name => $permissions ) {

            $entity = Entity::firstOrCreate(['name' => strtolower(trim($name)), ...$conditions]);

            static::resolvePermissions((array) $permissions)->each(function ( $perm ) use ( $entity, $conditions, $force ) {
                
                $permission = Permission::updateOrCreate(['entity_id' => $entity->id, 'name' => $perm['name'], ...$conditions], $perm);
               
                if ( $force ) SpecialPermission::where('permission_id', $permission->id)->delete();

            });

            static::forgetEntityPermissions($entity->name, $conditions);

        }

        return true;
        
    }

}
