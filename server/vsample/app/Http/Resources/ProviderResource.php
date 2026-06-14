<?php

namespace App\Http\Resources;

class ProviderResource extends BaseResource { 

    public function relations () {

        return [
            'supplier' => $this->setTenant($this->supplier_id, callback: fn() => StoreResource::info( $this->supplier )),
            'user'     => $this->setTenant($this->supplier_id, callback: fn() => UserResource::info( $this->user )),
        ];

    }

}
