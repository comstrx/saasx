<?php

namespace App\Http\Requests;

class CouponRequest extends BaseRequest {

    public function setRules () {

        return [
            'code'          => $this->uniqueRule('coupons', 'code'),
            'discount_type' => $this->enumRule(['fixed', 'percentage'], true),
            'discount'      => $this->amountRule(true),
        ];

    }

}
