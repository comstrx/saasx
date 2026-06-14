<?php

namespace App\Http\Resources;

class ResetResource extends BaseResource {

    public function data () {

        return [
            'token' => $this->token,
        ];

    }
    public function relations () {

        return [
            'user' => UserResource::info( $this->user ),
        ];

    }
    
}
