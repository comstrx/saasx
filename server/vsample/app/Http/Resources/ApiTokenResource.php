<?php

namespace App\Http\Resources;

class ApiTokenResource extends BaseResource {

    public function tiny ( $data ) {

        return [
            'key'          => $data->key,
            'secret'       => $data->secret,
            'expires_at'   => $data->formatDate('expires_at'),
            'last_used_at' => $data->formatDate('last_used_at'),
        ];

    }
    public function relations () {

        return [
            'user' => UserResource::info( $this->user ),
        ];

    }

}
