<?php

namespace App\Http\Requests;

class PaymentRequest extends BaseRequest {

    public function setRules () {

        return [
            'amount'       => $this->amountRule(true),
            'gateway'      => $this->existsRule('gateways', 'name', true),
            'redirect_url' => $this->urlRule(),
            'failed_url'   => $this->urlRule(),
            'description'  => $this->textRule(),
            'reason'       => $this->textRule(),
            'recipient'    => $this->arrayRule( $this->isRoute('wallet.withdraw') ),
            'recipient.email' => $this->emailRule(),
        ];

    }

}
