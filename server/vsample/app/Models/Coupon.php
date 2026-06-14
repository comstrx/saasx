<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use App\Traits\Model\HasBaseModel;

class Coupon extends Model {

    use HasBaseModel;

    protected array $relationPreference = [
        'users'  => 'couponUsers',
        'usages' => 'couponUsages',
    ];

    public function usersCount () { return $this->couponUsers()->count(); }
    public function usagesCount () { return $this->couponUsages()->count(); }

    public function isValid ( User $user = null ) {

        $user = $user ?? client();
        if ( !$user ) return false;

        $userCoupons   = $this->couponUsers()->where('user_id', $user->id)->count();
        $activeCoupons = $this->couponUsers()->where('user_id', $user->id)->notUsed()->notExpired()->count();

        return (
            !$activeCoupons &&
            $userCoupons < $this->max_uses &&
            integer($user->level) >= $this->min_level &&
            integer($user->orders?->count()) >= $this->min_orders &&
            integer($user->wallet?->points) >= $this->points
        );

    }

}
