<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use App\Traits\Model\HasBaseModel;

class Zone extends Model {

    use HasBaseModel;

    public function scopeVerified ( Builder $query ) { return $query->active()->where('status', 'verified'); }
   
    public function isVerified () { return $this->active && $this->status === 'verified'; }
    public function isValid () { return $this->isVerified() && $this->type === 'internal'; }
    public function setVerified () { return $this->update(['status' => 'verified']); }
    public function setFailed () { return $this->update(['status' => 'failed']); }
    public function setPending () { return $this->update(['status' => 'pending']); }

}
