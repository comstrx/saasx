<?php

namespace App\Http\Resources;

class CountryResource extends BaseResource {

    protected bool $hasImage = true;

    public function tiny ( $data ) {

        return [
            'iso'  => $data->iso,
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
            'rating'     => $this->rating(),
            'cities'     => $this->citiesCount(),
            'categories' => $this->categoriesCount(),
            'games'      => $this->gamesCount(),
            'products'   => $this->productsCount(),
            'orders'     => $this->ordersCount(),
            'reviews'    => $this->reviewsCount(),
        ];

    }

}
