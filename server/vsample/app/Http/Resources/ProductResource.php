<?php

namespace App\Http\Resources;

class ProductResource extends BaseResource {

    protected bool $hasAttachments = true;

    public function tiny ( $data ) {

        return [
            'game_id'     => $data->game_id,
            'name'        => $data->name,
            'total_price' => $data->totalPrice(),
        ];

    }
    public function data () {

        return [
            'company'         => $this->company,
            'location'        => $this->location,
            'description'     => $this->description,
            'details'         => $this->details,
            'includes'        => $this->includes,
            'policy'          => $this->policy,
            'instructions'    => $this->instructions,
            'upgrades'        => $this->upgrades,
            'type'            => $this->type,
            'delivery_method' => $this->delivery_method,
            'phone'           => $this->phone,
            'gender'          => $this->gender,
            'language'        => $this->language,
            'old_price'       => $this->old_price,
            'new_price'       => $this->new_price,
            'margin_price'    => $this->margin_price,
            'cancel_cost'     => $this->cancel_cost,
            'max_quantity'    => $this->max_quantity,
            'views'           => $this->views,
            'likes'           => $this->likes,
            'dislikes'        => $this->dislikes,
            'cancel_before'   => $this->formatDate('cancel_before'),
            'refund_before'   => $this->formatDate('refund_before'),
        ];

    }
    public function relations () {

        return [
            'category'     => CategoryResource::info( $this->category ),
            'game'         => GameResource::info( $this->game ),
            'city'         => CityResource::info( $this->city ),
            'country'      => CountryResource::info( $this->country ),
            'platform'     => PlatformResource::info( $this->platform ),
            'region'       => RegionResource::info( $this->region ),
            'in_favorites' => $this->isFavorite(),
            'in_cart'      => $this->isCart(),
            'rating'       => $this->rating(),
            'orders'       => $this->ordersCount(),
            'reviews'      => $this->reviewsCount(),
        ];

    }

}
