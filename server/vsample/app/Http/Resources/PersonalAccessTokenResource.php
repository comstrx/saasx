<?php

namespace App\Http\Resources;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PersonalAccessTokenResource extends JsonResource {

    public function toArray ( Request $req ) {

        return [
            'id'           => $this->id,
            'name'         => $this->name,
            'abilities'    => $this->abilities,
            'is_me'        => $this->isMe(),
            'created_at'   => format_date($this->created_at),
            'expires_at'   => format_date($this->expires_at),
            'last_used_at' => format_date($this->last_used_at),
        ];

    }

}
