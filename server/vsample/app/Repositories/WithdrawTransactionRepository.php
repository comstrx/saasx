<?php

namespace App\Repositories;
use App\Models\WithdrawTransaction;

class WithdrawTransactionRepository extends BaseRepository {

    public function __construct ( WithdrawTransaction $model ) { parent::__construct($model); }

    public function fields ( array $data = [] ) {
        
        return [
            'withdraw_method_id' => integer(data_get($data, 'withdraw_method_id')),
            'user_id'     => integer(data_get($data, 'user_id')),
            'currency'    => string(data_get($data, 'currency') ?? 'USD'),
            'amount'      => float(data_get($data, 'amount')),
            'tax_amount'  => float(data_get($data, 'tax_amount')),
            'tax_value'   => float(data_get($data, 'tax_value')),
            'tax_rate'    => float(data_get($data, 'tax_rate')),
            'description' => string(data_get($data, 'description')),
            'notes'       => string(data_get($data, 'notes')),
            'status'      => string(data_get($data, 'status') ?? 'pending'),
            'recipient'   => data_get($data, 'recipient'),
        ];

    }

}
