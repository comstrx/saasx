<?php

namespace App\Http\Resources;

class TransactionResource extends BaseResource {

    public function tiny ( $data ) {

        return [
            'reference' => $data->reference,
            'type'      => $data->type,
            'status'    => $data->status,
            'payment'   => $data->payment,
            'amount'    => $data->amount,
            'currency'  => $data->currency,
        ];

    }
    public function data () {

        return [
            'paid_currency'   => $this->paid_currency,
            'paid_amount'     => $this->paid_amount,
            'released_amount' => $this->released_amount,
            'tax_amount'      => $this->tax_amount,
            'exchange_amount' => $this->exchange_amount,
            'exchange_rate'   => $this->exchange_rate,
            'refund_days'     => $this->refund_days,
            'description'     => $this->description,
            'recipient'       => $this->recipient,
            'allow_refund'    => $this->allow_refund,
            'deleted'         => $this->deleted,
            'can_refund'      => $this->canRefund(),
            'refunded_amount' => $this->refundedAmount(),
        ];

    }
    public function relations () {

        return [
            'user'  => UserResource::info( $this->walletUser ?? $this->orderUser ),
            'order' => OrderResource::info( $this->order ),
            'withdraw_method' => WithdrawMethodResource::info( $this->withdrawMethod ),
        ];

    }

}
