<?php

namespace App\Http\Resources;

class MessageResource extends BaseResource {

    protected bool $hasAttachments = true;

    public function tiny ( $data ) {

        return [
            'type'         => $data->type,
            'content'      => $data->content,
            'history'      => $data->history,
            'edited'       => $data->edited,
            'edited_at'    => $data->formatDate('edited_at'),
            'is_delivered' => $data->checkAction('delivered'),
            'is_read'      => $data->checkAction('read'),
            'sender_role'  => $data->sender?->role,
        ];

    }
    public function relations () {

        return [
            'replied'  => MessageResource::info( $this->replied ),
            'sender'   => UserResource::info( $this->sender ),
            'room'     => RoomResource::info( $this->room ),
            'product'  => ProductResource::info( $this->product ),
            'settings' => MessageActionResource::info( $this->currentAction() ),
            'actions'  => MessageActionResource::collection( $this->anotherActions() ),
        ];

    }

}
