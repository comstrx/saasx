<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use App\Traits\Model\HasBaseModel;

class Identity extends Model {

    use HasBaseModel;

    protected static function boot () {

        parent::boot();
        static::saving(function ( $instance ) { $instance->validate(); });

    }

    public function front_image () { return null; }
    public function back_image () { return null; }
    public function image () { return null; }

    public function reject ( $reason ) {

        $this->update(['status' => 'rejected', 'rejection_reason' => $reason, 'rejected_at' => utc_date(), 'approved_at' => null]);

    }
    public function approve () {

        $this->update(['status' => 'approved', 'approved_at' => utc_date(), 'rejection_reason' => null, 'rejected_at' => null]);

    }
    public function validate () {

        if ( $this->type === 'national_id' ) return $this->validate_national();
        if ( $this->type === 'passport' ) return $this->validate_passport();
        if ( $this->type === 'driver_license' ) return $this->validate_license();

    }
    public function validate_national () {

        $front_image = $this->front_image();
        $back_image = $this->back_image();

        if ( !$front_image ) return $this->reject('invalid card front image');
        if ( !$back_image ) return $this->reject('invalid card back image');

        // ai code here ...

        $this->approve();
        return true;

    }
    public function validate_passport () {
       
        $image = $this->image();
        if ( !$image ) return $this->reject('invalid passport image');

        // ai code here ...

        $this->approve();
        return true;

    }
    public function validate_license () {
        
        $image = $this->image();
        if ( !$image ) return $this->reject('invalid license image');
        
        // ai code here ...

        $this->approve();
        return true;

    }

}
