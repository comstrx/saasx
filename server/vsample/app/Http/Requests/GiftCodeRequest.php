<?php

namespace App\Http\Requests;

class GiftCodeRequest extends BaseRequest {

    public function setRules () {

        return [
            'code' => $this->uniqueRule('gift_codes', 'code'),
            'type' => $this->enumRule(['public', 'private'], true),
        ];

    }

}
