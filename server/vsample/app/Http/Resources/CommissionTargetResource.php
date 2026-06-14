<?php

namespace App\Http\Resources;

class CommissionTargetResource extends BaseResource {

    public function tiny ( $data ) {

        return [
            'related_type' => $data->related_type,
            'related_id'   => $data->related_id,
            'related_name' => plural_snake($data->getRelatedName()),
            'expires_at'   => $data->formatDate('expires_at'),
        ];

    }
    public function relations () {

        return [
            'commission' => CommissionResource::info( $this->commission ),
            'related'    => $this->getRelatedResource(),
        ];

    }

}
