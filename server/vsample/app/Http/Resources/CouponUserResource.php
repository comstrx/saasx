<?php

namespace App\Http\Resources;

class CouponUserResource extends BaseResource {

    public function tiny ( $data ) {

        return [
            'points'     => $data->points,
            'status'     => $data->used_at ? 'used' : ($data->isExpired() ? 'expired' : 'pending'),
            'used_at'    => $data->formatDate('used_at'),
            'expires_at' => $data->formatDate('expires_at'),
        ];

    }
    public function relations () {

        return [
            'coupon' => CouponResource::make( $this->coupon, true ),
            'user'   => UserResource::info( $this->user ),
        ];

    }

}
