<?php

namespace App\Http\Resources;

class ViewResource extends BaseResource {

    public function relations () {

        return [
            'user' => UserResource::info( $this->user ),
            $this->getRelatedName() => $this->getRelatedResource(),
        ];

    }

}
