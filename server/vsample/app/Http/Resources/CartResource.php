<?php

namespace App\Http\Resources;

class CartResource extends BaseResource {

    public function data () {

        return [
            'quantity' => $this->quantity,
        ];

    }
    public function relations () {

        return [
            'user'    => UserResource::info( $this->user ),
            'product' => ProductResource::make( $this->product, true ),
        ];

    }

}
