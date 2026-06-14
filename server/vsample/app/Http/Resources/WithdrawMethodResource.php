<?php

namespace App\Http\Resources;

class WithdrawMethodResource extends BaseResource { 

    protected bool $hasImage = true, $hasPermissions = true;

    public function tiny ( $data ) {

        return [
            'code'        => $data->code,
            'currency'    => $data->currency,
            'name'        => $data->name,
            'fields'      => $data->fields,
            'description' => $data->description,
            'min_amount'  => $data->min_amount,
            'max_amount'  => $data->max_amount,
            'tax_value'   => $data->tax_value,
            'tax_rate'    => $data->tax_rate,
        ];

    }
    public function relations () {

        $transactions = $this->withdrawTransactions;

        return [
            'transactions'     => $transactions->count(),
            'total_amounts'    => $transactions->sum('amount'),
            'pending_amounts'  => $transactions->filter(fn($item) => $item->status === 'pending')->sum('amount'),
        ];

    }

}
