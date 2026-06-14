<?php

namespace App\Http\Resources;

class WithdrawTransactionResource extends BaseResource { 

    public function tiny ( $data ) {

        return [
            'currency'   => $data->currency,
            'amount'     => $data->amount,
            'tax_amount' => $data->tax_amount,
            'tax_value'  => $data->tax_value,
            'tax_rate'   => $data->tax_rate,
            'status'     => $data->status,
        ];

    }
    public function data () {

        return [
            'recipient'   => $this->recipient,
            'description' => $this->description,
            'deleted'     => $this->deleted,
        ];

    }
    public function relations () {

        return [
            'user'            => UserResource::info( $this->user ),
            'withdraw_method' => WithdrawMethodResource::info( $this->withdrawMethod ),
        ];

    }

}
