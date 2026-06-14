<?php

namespace App\Http\Resources;

class CommissionResource extends BaseResource {

    public function tiny ( $data ) {

        return [
            'name' => $data->name,
            'type' => $data->type,
            'role' => $data->role,
        ];

    }
    public function data () {

        return [
            'amount_type' => $this->amount_type,
            'amount'      => $this->amount,
            'amount_cap'  => $this->amount_cap,
            'priority'    => $this->priority,
            'max_price'   => $this->max_price,
            'min_price'   => $this->min_price,
            'min_orders'  => $this->min_orders,
            'min_level'   => $this->min_level,
            'description' => $this->description,
            'conditions'  => $this->conditions,
            'expires_at'  => $this->formatDate('expires_at'),
        ];

    }
    public function relations () {

        return [
            'country'  => CountryResource::info( $this->country ),
            'city'     => CityResource::info( $this->city ),
            'category' => CategoryResource::info( $this->category ),
            'game'     => GameResource::info( $this->game ),
            'product'  => ProductResource::info( $this->product ),
            'coupon'   => CouponResource::info( $this->coupon ),
            'users'    => $this->usersCount(),
            'usages'   => $this->usagesCount(),
        ];

    }

}
