<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use App\Traits\Model\HasBaseModel;

class Referral extends Model {

    use HasBaseModel;

    public function referrer () { return $this->belongsTo(User::class, 'referrer_id'); }
    public function referred () { return $this->belongsTo(User::class, 'referred_id'); }

}
