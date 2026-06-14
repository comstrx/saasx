<?php

namespace App\Http\Resources;

class CommissionUsageResource extends BaseResource {

    public function tiny ( $data ) {

        return [
            'amount' => $data->amount,
        ];

    }
    public function relations () {

        return [
            'commission'   => CommissionResource::info( $this->commission ),
            'user'         => UserResource::info( $this->user ),
            'order'        => OrderResource::info( $this->order ),
            'subscription' => SubscriptionResource::info( $this->subscription ),
            'transaction'  => TransactionResource::info( $this->transaction ),
        ];

    }

}
