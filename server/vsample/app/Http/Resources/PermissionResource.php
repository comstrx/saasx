<?php

namespace App\Http\Resources;

class PermissionResource extends BaseResource {

    public function tiny ( $data ) {

        return [
            'name'        => $data->name,
            'allow'       => $data->allow,
            'description' => $data->description,
        ];

    }
    public function relations () {

        return [
            'entity' => EntityResource::info( $this->entity ),
        ];

    }

}
