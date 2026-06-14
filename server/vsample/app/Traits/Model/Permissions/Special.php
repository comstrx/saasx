<?php

namespace App\Traits\Model\Permissions;

trait Special {

    use Helpers;

    public function allPermissions () {

        return $this->rememberPermissions("all", function () {

            return $this->entityPermissions()->pluck('name')->all();

        });
        
    }
    public function allowedPermissions () {

        return $this->rememberPermissions("{$this->id}_allowed", function () {

            [$public, $special] = [$this->entityPermissions()->get(), $this->specialPermissions()->get()];
            
            return $public->filter(fn($perm) => $this->checkPermissionAccess($perm, $special))->pluck('name')->all();

        });
    
    }
    public function deniedPermissions () {

        return $this->rememberPermissions("{$this->id}_denied", function () {

            [$public, $special] = [$this->entityPermissions()->get(), $this->specialPermissions()->get()];

            return $public->filter(fn($perm) => !$this->checkPermissionAccess($perm, $special))->pluck('name')->all();

        });
    
    }
    public function permissionsResource () {

        return $this->rememberPermissions("{$this->id}_resource", function () {

            [$all, $allowed, $denied] = [
                $this->allPermissions(),
                $this->allowedPermissions(),
                $this->deniedPermissions()
            ];
        
            $permissions = collect($all)->mapWithKeys(fn($perm) => [$perm => collect($allowed)->contains($perm)])->all();

            return ['all' => $all, 'allowed' => $allowed, 'denied' => $denied, 'permissions' => $permissions];

        });

    }
    public function resetPermissions () {

        return $this->specialPermissions()->delete() && $this->forgetPermissions();

    }
    
    public function assign ( string|array $name, bool $allow = true, array $conditions = [] ) {

        $permissions = $this->entityPermissions()
            ->whereIn('name', (array) $name)
            ->when(!empty($conditions), fn($q) => $q->where($conditions))
            ->pluck('id');

        $permissions->each(fn($id) =>
            $this->specialPermissions()->updateOrCreate(
                ['permission_id' => $id, ...$conditions], ['allow' => $allow]
            )
        );
       
        return $this->forgetPermissions(attributes: $conditions);

    }
    public function allow ( ...$names ) {

        return $this->assign($names, true);

    }
    public function deny ( ...$names ) {

        return $this->assign($names, false);
        
    }

    public function hasAll ( ...$names ) {

        return collect($this->resolveNames($names))
            ->every(fn($name) => collect($this->resolveNames($this->allowedPermissions()))->contains($name));

    }
    public function hasAny ( ...$names ) {

        return collect($this->resolveNames($this->allowedPermissions()))
            ->intersect($this->resolveNames($names))->isNotEmpty();

    }
    public function has ( ...$names ) {

        return $this->hasAll(...$names);

    }
    public function notHasAll ( ...$names ) {

        return !$this->hasAll(...$names);

    }
    public function notHasAny ( ...$names ) {

        return !$this->hasAny(...$names);

    }
    public function notHas ( ...$names ) {

        return !$this->hasAny(...$names);

    }

    public function ifHasAll ( ...$names ) {

        return $this->hasAll(...$names) ? $this : null;

    }
    public function ifHasAny ( ...$names ) {

        return $this->hasAny(...$names) ? $this : null;

    }
    public function ifHas ( ...$names ) {

        return $this->has(...$names) ? $this : null;

    }
    public function ifNotHasAll ( ...$names ) {

        return $this->notHasAll(...$names) ? $this : null;

    }
    public function ifNotHasAny ( ...$names ) {

        return $this->notHasAny(...$names) ? $this : null;

    }
    public function ifNotHas ( ...$names ) {

        return $this->notHas(...$names) ? $this : null;

    }
   
    public function hasAllOrFail ( ...$names ) {

        return $this->ifHasAll(...$names) ?? $this->failPermissionNow();

    }
    public function hasAnyOrFail ( ...$names ) {

        return $this->ifHasAny(...$names) ?? $this->failPermissionNow();

    }
    public function hasOrFail ( ...$names ) {

        return $this->ifHas(...$names) ?? $this->failPermissionNow();

    }
    public function notHasAllOrFail ( ...$names ) {

        return $this->ifNotHasAll(...$names) ?? $this->failPermissionNow();

    }
    public function notHasAnyOrFail ( ...$names ) {

        return $this->ifNotHasAny(...$names) ?? $this->failPermissionNow();

    }
    public function notHasOrFail ( ...$names ) {

        return $this->ifNotHas(...$names) ?? $this->failPermissionNow();

    }

}
