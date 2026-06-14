<?php

namespace App\Http\Resources;

class StoreResource extends BaseResource {
    
    public function tiny ( $data ) {

        return $this->setTenant($data->id, callback: fn() => [
            'image' => $data->getImage() ?? $data->siteInfo?->getImage(),
            'name'  => $data->name,
            'phone' => $data->phone,
            'email' => $data->email,
            'host'  => $data->zone?->name ?? $data->domains?->firstWhere('dest', 'client')?->name,
        ]);

    }
    public function relations () {

        return $this->setTenant($this->id, callback: function () {

            return  [
                'subscription' => SubscriptionResource::info( $this->subscription ),
                'plan'         => PlanResource::info( $this->plan ),
                'parent'       => StoreResource::info( $this->parent ),
                'owner'        => UserResource::info( $this->storeOwner($this->id) ),
                'admin'        => UserResource::info( $this->storeAdmin($this->id) ),
                'zone'         => ZoneResource::info( $this->zone ),
                'domains'      => DomainResource::collectionInfo( $this->domains ),
            ];

        });

    }
    public function stats () {

        return $this->setTenant($this->id, callback: fn() => [
            'countries'  => $this->countriesCount(),
            'cities'     => $this->citiesCount(),
            'categories' => $this->categoriesCount(),
            'games'      => $this->gamesCount(),
            'products'   => $this->productsCount(),
            'coupons'    => $this->couponsCount(),
            'orders'     => $this->ordersCount(),
            'giftCodes'  => $this->giftCodesCount(),
            'platforms'  => $this->platformsCount(),
            'regions'    => $this->regionsCount(),
            'blogs'      => $this->blogsCount(),
            'comments'   => $this->commentsCount(),
            'reviews'    => $this->reviewsCount(),
            'replies'    => $this->repliesCount(),
        ]);

    }

}
