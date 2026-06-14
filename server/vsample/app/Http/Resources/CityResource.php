<?php

namespace App\Http\Resources;

class CityResource extends BaseResource {

    protected bool $hasImage = true;

    public function tiny ( $data ) {

        return [
            'code' => $data->code,
            'name' => $data->name,
        ];
        
    }
    public function data () {

        return [
            'description' => $this->description,
            'views'       => $this->views,
            'likes'       => $this->likes,
            'dislikes'    => $this->dislikes,
        ];

    }
    public function relations () {

        return [
            'country'    => CountryResource::info( $this->country ),
            'rating'     => $this->rating(),
            'categories' => $this->categoriesCount(),
            'games'      => $this->gamesCount(),
            'products'   => $this->productsCount(),
            'orders'     => $this->ordersCount(),
            'reviews'    => $this->reviewsCount(),
        ];

    }

}
