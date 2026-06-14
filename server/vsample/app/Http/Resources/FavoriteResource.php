<?php

namespace App\Http\Resources;

class FavoriteResource extends BaseResource {

    public function relations () {

        return [
            'user' => UserResource::info( $this->user ),
            $this->getRelatedName() => $this->makeRelatedResource(),
        ];

    }

}
