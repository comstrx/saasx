<?php

declare(strict_types=1);

namespace App\Models;
use App\Enums\Authority;
use App\Enums\PermissionScope;
use App\Enums\RoleType;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PermissionSetting extends TenantModel {

    protected $table = 'permission_settings';
    protected $fillable = ['tenant_id', 'permission_id', 'scope', 'role', 'target_type', 'target_id', 'user_id', 'allow', 'locked', 'authority'];

    /** @return array<string, mixed> */
    protected function casts (): array {

        return ['scope' => PermissionScope::class, 'authority' => Authority::class, 'role' => RoleType::class, 'allow' => 'boolean', 'locked' => 'boolean'];

    }
    /** @return BelongsTo<Permission, $this> */
    public function permission (): BelongsTo {

        return $this->belongsTo(Permission::class);

    }
    /** @return BelongsTo<User, $this> */
    public function user (): BelongsTo {

        return $this->belongsTo(User::class);

    }

}
