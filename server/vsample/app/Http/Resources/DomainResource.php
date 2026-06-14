<?php

namespace App\Http\Resources;

class DomainResource extends BaseResource {

    public function tiny ( $data ) {

        return [
            'name'   => $data->name,
            'dest'   => $data->dest,
            'status' => $data->status,
        ];

    }
    public function data () {

        return [
            'provider_id' => $this->provider_id,
            'type'        => $this->type,
        ];

    }
    public function relations () {

        return [
            'store' => StoreResource::info( $this->store ),
            'zone'  => ZoneResource::info( $this->zone ),
        ];

    }

}
