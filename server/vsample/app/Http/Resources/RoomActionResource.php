<?php

namespace App\Http\Resources;

class RoomActionResource extends BaseResource {

    public function tiny ( $data ) {

        return [
            'muted'    => $data->muted,
            'pinned'   => $data->pinned,
            'deleted'  => $data->deleted,
            'archived' => $data->archived,
        ];

    }
    public function relations () {

        return [
            'user' => UserResource::info( $this->user ),
        ];

    }
   
}
