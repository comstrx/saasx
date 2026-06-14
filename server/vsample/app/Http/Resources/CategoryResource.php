<?php

namespace App\Http\Resources;

class CategoryResource extends BaseResource {

    protected bool $hasImage = true;

    public function tiny ( $data ) {

        return [
            'name' => $data->name,
        ];
        
    }
    public function data () {

        return [
            'company'     => $this->company,
            'location'    => $this->location,
            'description' => $this->description,
            'phone'       => $this->phone,
            'views'       => $this->views,
            'likes'       => $this->likes,
            'dislikes'    => $this->dislikes,
        ];

    }
    public function relations () {

        return [
            'parent'       => self::info( $this->parent ),
            'city'         => CityResource::info( $this->city ),
            'country'      => CountryResource::info( $this->country ),
            'in_favorites' => $this->isFavorite(),
            'rating'       => $this->rating(),
            'childrens'    => $this->childrensCount(),
            'games'        => $this->gamesCount(),
            'products'     => $this->productsCount(),
            'orders'       => $this->ordersCount(),
            'reviews'      => $this->reviewsCount(),
        ];

    }

}
