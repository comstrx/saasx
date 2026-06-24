<?php

declare(strict_types=1);

namespace App\Models;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Permission extends BaseModel {

    protected $table = 'permissions';
    protected $fillable = ['key', 'group', 'label'];

    /** @return HasMany<PermissionSetting, $this> */
    public function settings (): HasMany {

        return $this->hasMany(PermissionSetting::class);

    }

}
