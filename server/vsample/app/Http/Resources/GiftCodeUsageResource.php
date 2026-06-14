<?php

namespace App\Http\Resources;

class GiftCodeUsageResource extends BaseResource {

    public function relations () {

        return [
            'gift_code' => GiftCodeResource::info( $this->giftCode ),
            'product'   => ProductResource::info( $this->product ),
            'order'     => OrderResource::info( $this->giftCode?->order ),
            'user'      => UserResource::info( $this->user ),
        ];

    }

}
