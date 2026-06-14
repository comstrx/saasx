<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use App\Traits\Model\HasBaseModel;

class Like extends Model {

    use HasBaseModel;

    public function scopeLike ( $query ) { return $query->active()->where('like', true); }
    public function scopeDislike ( $query ) { return $query->active()->where('dislike', true); }

}
