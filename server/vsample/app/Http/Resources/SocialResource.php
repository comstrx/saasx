<?php

namespace App\Http\Resources;

class SocialResource extends BaseResource {

    public function tiny ( $data ) {

        return [
            'name'     => $data->name,
            'email'    => $data->email,
            'phone'    => $data->phone,
            'image'    => $data->image,
            'provider' => $data->provider_name,
        ];

    }
    public function relations () {

        return [
            'user' => UserResource::info( $this->user ),
        ];

    }

}
