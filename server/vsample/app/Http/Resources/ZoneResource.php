<?php

namespace App\Http\Resources;

class ZoneResource extends BaseResource {

    public function tiny ( $data ) {

        return [
            'name'   => $data->name,
            'status' => $data->status,
            'ns1'    => $data->ns1,
            'ns2'    => $data->ns2,
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
        ];

    }

}
