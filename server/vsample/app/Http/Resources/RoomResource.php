<?php

namespace App\Http\Resources;

class RoomResource extends BaseResource {

    protected bool $hasImage = true;

    public function tiny ( $data ) {

        return [
            'type'        => $data->type,
            'name'        => $data->name,
            'description' => $data->description,
        ];

    }
    public function relations () {

        return [
            'settings'     => RoomActionResource::info( $this->currentAction() ),
            'members'      => RoomMemberResource::collection( $this->anotherMembers() ),
            'last_message' => MessageResource::info( $this->lastMessage ),
            'last_used_at' => $this->lastUsedAt(),
            'unread_count' => $this->unread_count,
            'undelivered_count' => $this->undelivered_count,
        ];

    }

}
