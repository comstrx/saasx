<?php

namespace App\Http\Resources;

class CommissionRuleResource extends BaseResource {

    public function tiny ( $data ) {

        return [
            'key'      => $data->key,
            'operator' => $data->operator,
            'value'    => $data->value,
            'required' => $data->required,
        ];

    }
    public function relations () {

        return [
            'commission' => CommissionResource::info( $this->commission ),
        ];

    }

}
