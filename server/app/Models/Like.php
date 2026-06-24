<?php

declare(strict_types=1);

namespace App\Models;

class Like extends TenantModel {

    protected $table = 'likes';
    protected $fillable = ['user_id', 'value'];

    /** @return array<string, mixed> */
    protected function casts (): array {

        return ['value' => 'boolean'];

    }

}
