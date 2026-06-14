<?php

namespace App\Http\Resources;

class MessageActionResource extends BaseResource {

    public function tiny ( $data ) {

        return [
            'reaction'     => $data->reaction,
            'starred'      => $data->starred,
            'deleted'      => $data->deleted,
            'read'         => $data->read,
            'delivered'    => $data->delivered,
            'read_at'      => $data->formatDate('read_at'),
            'delivered_at' => $data->formatDate('delivered_at'),
        ];

    }
    public function relations () {

        return [
            'user' => UserResource::info( $this->user ),
        ];

    }

}
