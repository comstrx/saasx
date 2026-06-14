<?php

namespace App\Http\Resources;

class GiftCodeResource extends BaseResource {

    public function tiny ( $data ) {

        return [
            'code'       => $data->code,
            'type'       => $data->type,
            'used_at'    => $data->formatDate('used_at'),
            'expires_at' => $data->formatDate('expires_at'),
        ];
        
    }
    public function relations () {

        return [
            'game'    => GameResource::info( $this->game ),
            'product' => ProductResource::info( $this->product ),
            'user'    => UserResource::info( $this->user ),
            'order'   => OrderResource::info( $this->order ),
            'usage'   => GiftCodeUsageResource::info( $this->giftCodeUsage ),
        ];

    }

}
