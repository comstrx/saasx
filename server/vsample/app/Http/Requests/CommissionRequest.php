<?php

namespace App\Http\Requests;

class CommissionRequest extends BaseRequest {

    public function setRules () {

        return [
            'type'        => $this->enumRule(['amount', 'points'], true),
            'amount_type' => $this->enumRule(['fixed', 'percentage'], true),
            'amount'      => $this->amountRule(true),
        ];

    }

}
