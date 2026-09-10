<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Note extends Model
{
    protected $fillable = ['title', 'path'];

    protected function casts(): array
    {
        return [
            'indexed_at' => 'datetime',
        ];
    }
}
