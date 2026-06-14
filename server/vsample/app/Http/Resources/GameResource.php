<?php

namespace App\Http\Resources;

class GameResource extends BaseResource {

    protected bool $hasAttachments = true;

    public function tiny ( $data ) {

        return [
            'name' => $data->name,
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
            'fields'          => $this->fields,
            'type'            => $this->type,
            'delivery_method' => $this->delivery_method,
            'phone'           => $this->phone,
            'gender'          => $this->gender,
            'language'        => $this->language,
            'views'           => $this->views,
            'likes'           => $this->likes,
            'dislikes'        => $this->dislikes,
        ];

    }
    public function relations () {

        return [
            'category'     => CategoryResource::info( $this->category ),
            'city'         => CityResource::info( $this->city ),
            'country'      => CountryResource::info( $this->country ),
            'regions'      => RegionResource::collectionInfo( $this->regions ),
            'platforms'    => PlatformResource::collectionInfo( $this->platforms ),
            'in_favorites' => $this->isFavorite(),
            'rating'       => $this->rating(),
            'products'     => $this->productsCount(),
            'orders'       => $this->ordersCount(),
            'reviews'      => $this->reviewsCount(),
        ];

    }

}
