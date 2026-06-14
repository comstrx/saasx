<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use App\Traits\Model\HasBaseModel;

class Permission extends Model {

    use HasBaseModel;

    public function entity () { return $this->belongsTo(Entity::class); }
    
}
