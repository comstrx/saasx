<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use App\Traits\Model\HasBaseModel;

class Domain extends Model {

    use HasBaseModel;

    public function scopeVerified ( Builder $query ) { return $query->active()->where('status', 'verified'); }

    public function isVerified () { return $this->status === 'verified'; }
    public function setVerified () { return $this->update(['status' => 'verified']); }
    public function setFailed () { return $this->update(['status' => 'failed']); }
    public function setPending () { return $this->update(['status' => 'pending']); }

}
