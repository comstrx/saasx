<?php

namespace App\Repositories;
use App\Models\CouponUser;

class CouponUserRepository extends BaseRepository {

    public function __construct( CouponUser $model ) { parent::__construct($model); }

    public function fields ( array $data = [] ) {

        $data = optional($data);

        return [
            'coupon_id'  => integer($data['coupon_id']),
            'user_id'    => integer($data['user_id']),
            'points'     => integer($data['points']),
            'used_at'    => string($data['used_at']),
            'expires_at' => string($data['expires_at']),
        ];

    }

}
