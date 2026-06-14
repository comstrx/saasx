<?php

namespace App\Http\Resources;

class RoomMemberResource extends BaseResource {

    public function relations () {

        return [
            'user' => UserResource::info( $this->user ),
        ];

    }

}
