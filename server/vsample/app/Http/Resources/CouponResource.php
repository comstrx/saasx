<?php

namespace App\Http\Resources;

class CouponResource extends BaseResource {

    protected bool $hasImage = true;

    public function tiny ( $data ) {

        return [
            'code'          => $data->code,
            'name'          => $data->name,
            'type'          => $data->type,
            'points'        => $data->points,
            'discount_type' => $data->discount_type,
            'discount'      => $data->discount,
            'max_discount'  => $data->max_discount,
            'min_price'     => $data->min_price,
            'max_price'     => $data->max_price,
            'max_usages'    => $data->max_usages,
            'max_uses'      => $data->max_uses,
            'min_orders'    => $data->min_orders,
            'min_level'     => $data->min_level,
            'description'   => $data->description,
            'conditions'    => $data->conditions,
            'expires_at'    => $data->formatDate('expires_at'),
            'is_valid'      => $data->isValid(),
        ];

    }
    public function relations () {

        return [
            'country'  => CountryResource::info( $this->country ),
            'city'     => CityResource::info( $this->city ),
            'category' => CategoryResource::info( $this->category ),
            'game'     => GameResource::info( $this->game ),
            'product'  => ProductResource::info( $this->product ),
            'users'    => $this->usersCount(),
            'usages'   => $this->usagesCount(),
        ];

    }

}
