<?php

namespace App\Http\Resources;

class ReferralResource extends BaseResource {

    public function relations () {

        return [
            'referrer' => UserResource::info( $this->referrer ),
            'referred' => UserResource::info( $this->referred ),
        ];

    }

}
