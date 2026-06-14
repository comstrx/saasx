<?php

namespace App\Http\Resources;

class GatewayResource extends BaseResource {

    protected bool $hasImage = true;
    
    public function tiny ( $data ) {

        return [
            'name'               => $data->name,
            'type'               => $data->type,
            'country'            => $data->country,
            'currency'           => $data->currency,
            'language'           => $data->language,
            'description'        => $data->description,
            'min_deposit_value'  => $data->min_deposit_value,
            'max_deposit_value'  => $data->max_deposit_value,
            'min_withdraw_value' => $data->min_withdraw_value,
            'max_withdraw_value' => $data->max_withdraw_value,
            'deposit_tax_value'  => $data->deposit_tax_value,
            'withdraw_tax_value' => $data->withdraw_tax_value,
            'deposit_tax_rate'   => $data->deposit_tax_rate,
            'withdraw_tax_rate'  => $data->withdraw_tax_rate,
            'refund_days'        => $data->refund_days,
            ...$data->publicCredentials(),
        ];

    }
    public function data () {

        return [
            'allow_deposit'  => $this->allow_deposit,
            'allow_withdraw' => $this->allow_withdraw,
            'allow_refund'   => $this->allow_refund,
            'allow_pay'      => $this->allow_pay,
            'sandbox'        => $this->sandbox,
            'credentials'    => $this->credentials,
            'webhooks'       => $this->webhooks,
        ];

    }

}
