<?php

namespace App\Http\Resources;

class EntityResource extends BaseResource {

    public function tiny ( $data ) {

        return [
            'name' => $data->name,
        ];

    }

}
