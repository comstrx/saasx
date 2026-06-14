<?php

namespace App\Http\Resources;

class IdentityResource extends BaseResource {

    public function tiny ( $data ) {

        return [
            'type'   => $data->type,
            'status' => $data->status,
        ];

    }
    public function data () {

        return [
            'country'     => $this->country,
            'city'        => $this->city,
            'name'        => $this->name,
            'number'      => $this->number,
            'image'       => $this->image(),
            'front_image' => $this->front_image(),
            'back_image'  => $this->back_image(),
            'approved_at' => $this->formatDate('approved_at'),
            'rejected_at' => $this->formatDate('rejected_at'),
            'rejection_reason' => $this->rejection_reason,
        ];

    }
    public function relations () {

        return [
            'user' => UserResource::info( $this->user ),
        ];

    }

}
