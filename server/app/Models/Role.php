<?php

declare(strict_types=1);

namespace App\Models;
use App\Enums\RoleType;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Role extends TenantModel {

    protected $table = 'roles';
    protected $fillable = ['tenant_id', 'role', 'is_super', 'is_supervisor'];

    /** @return array<string, mixed> */
    protected function casts (): array {

        return ['role' => RoleType::class, 'is_super' => 'boolean', 'is_supervisor' => 'boolean'];

    }
    /** @return BelongsToMany<User, $this> */
    public function users (): BelongsToMany {

        return $this->belongsToMany(User::class, 'user_roles');

    }

}
