<?php

declare(strict_types=1);

namespace App\Traits\Dna;
use App\Models\Role;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/** @mixin \Illuminate\Database\Eloquent\Model */
trait HasRoles {

    /** @return BelongsToMany<Role, $this> */
    public function roles (): BelongsToMany {

        return $this->belongsToMany(Role::class, 'user_roles');

    }
    /** @param string|list<string> $role */
    public function hasRole ( string|array $role ): bool {

        return $this->roles()->whereIn('role', is_array($role) ? $role : [$role])->exists();

    }
    public function isSuper (): bool {

        return $this->roles()->where('is_super', true)->exists();

    }
    public function isSupervisor (): bool {

        return $this->roles()->where('is_supervisor', true)->exists();

    }

}
