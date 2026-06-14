<?php

namespace App\Http\Resources;

class CouponUsageResource extends BaseResource {

    public function tiny ( $data ) {

        return [
            'code'     => $data->code,
            'discount' => $data->discount,
        ];

    }
    public function relations () {

        return [
            'coupon' => CouponResource::info( $this->coupon ),
            'user'   => UserResource::info( $this->user ),
        ];

    }

}
