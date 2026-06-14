<?php

namespace App\Http\Resources;

class LikeResource extends BaseResource {

    public function data () {

        return [
            'like' => $this->like,
        ];

    }
    public function relations () {

        return [
            'user' => UserResource::info( $this->user ),
            $this->getRelatedName() => $this->getRelatedResource(),
        ];

    }

}
