<?php

namespace App\Repositories;
use App\Models\CouponUsage;

class CouponUsageRepository extends BaseRepository {

    public function __construct( CouponUsage $model ) { parent::__construct($model); }

    public function fields ( array $data = [] ) {

        $data = optional($data);

        return [
            'coupon_id' => integer($data['coupon_id']),
            'user_id'   => integer($data['user_id']),
            'code'      => string($data['code']),
            'discount'  => float($data['discount']),
        ];

    }

}
