<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use App\Traits\Model\HasBaseModel;

class Provider extends Model {

    use HasBaseModel;

    public function supplier () { return $this->belongsTo(Store::class, 'supplier_id'); }

}
