<?php

namespace App\Traits\Model\Permissions;
use Illuminate\Database\Eloquent\Collection;
use App\Traits\Model\HasHelpers;
use App\Models\SpecialPermission;
use App\Models\Permission;
use App\Models\Entity;
use App\Models\User;

trait Helpers {

    use HasHelpers;
    
    protected static ?string $realEntity;

    public static function setEntity ( string $entity = null ) {

        static::$realEntity = $entity;
        return (new static);

    }
    protected function entityName () {
        
        return static::$realEntity ?? ($this instanceof User ? $this->role : strtolower(snake(class_basename(static::class))));
    
    }
    protected function entity () {
        
        return Entity::firstOrCreate(['name' => $this->entityName() ?? '']);

    }
    protected function entityPermissions () {

        return $this->entity()?->permissions() ?? $this->nullRelation('hasMany');
    
    }
    protected function specialPermissions () {

        return $this->morphMany(SpecialPermission::class, 'related')->with('permission');
    
    }
    protected function rememberPermissions ( string $key, callable $callback ) {

        return $this->remember($this->entityName() . "_permissions", $key, 60, $callback);

    }
    protected function forgetPermissions ( string $name = null, array $attributes = [] ) {

        $this->deleteCacheTag(($name ?? $this->entityName()). "_permissions", $attributes);
        return true;

    }
    protected function checkPermissionAccess ( Permission $public, Collection $specials ) {

        $special = $specials->firstWhere('permission_id', $public->id);
        return $special ? bool($special->allow) : bool($public->allow);

    }
    protected function resolveNames ( array $names ) {

        return collect($names)->map(fn($name) => strtolower(trim($name ?? '')))->filter()->all();

    }
    protected static function getEntityPermissions () {

        return (new static)->entityPermissions();
        
    }
    protected static function forgetEntityPermissions ( string $name = null, array $attributes = [] ) {

        return (new static)->forgetPermissions($name, $attributes);
        
    }

}
