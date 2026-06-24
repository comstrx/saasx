<?php

declare(strict_types=1);

namespace App\Models;
use App\Traits\Dna\HasPermissions;
use App\Traits\Dna\HasRoles;
use App\Traits\Dna\Social\HasSocial;
use Laravel\Sanctum\HasApiTokens;

class User extends TenantModel {

    use HasApiTokens, HasRoles, HasPermissions, HasSocial;

    protected $table = 'users';
    protected $fillable = ['name', 'email', 'password', 'tenant_id'];
    protected $hidden = ['password'];

    /** @return array<string, mixed> */
    protected function casts (): array {

        return ['email_verified_at' => 'datetime', 'password' => 'hashed'];

    }

}
