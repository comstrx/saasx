<?php

namespace App\Http\Resources;

class WalletResource extends BaseResource {

    public function tiny ( $data ) {

        return [
            'pending_balance'   => $this->pending_balance,
            'buy_balance'       => $this->buy_balance,
            'withdraw_balance'  => $this->withdraw_balance,
            'fee_balance'       => $this->fee_balance,
            'points'            => $this->points,
            'total_balance'     => $data->total_balance(),
            'available_balance' => $data->available_balance(),
        ];

    }
    public function data () {

        return [
            'total_withdraws'   => $this->total_withdraws,
            'total_deposits'    => $this->total_deposits,
            'total_transfers'   => $this->total_transfers,
            'total_refunds'     => $this->total_refunds,
            'total_cashback'    => $this->total_cashback,
            'total_pays'        => $this->total_pays,
            'referral_earnings' => $this->referral_earnings,
            'earned_points'     => $this->earned_points,
        ];

    }

}
