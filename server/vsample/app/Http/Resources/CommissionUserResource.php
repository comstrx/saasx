<?php

namespace App\Http\Resources;

class CommissionUserResource extends BaseResource {

    public function tiny ( $data ) {

        return [
            'expires_at' => $data->formatDate('expires_at'),
        ];

    }
    public function relations () {

        return [
            'commission' => CommissionResource::info( $this->commission ),
            'user'       => UserResource::info( $this->user ),
        ];

    }

}
