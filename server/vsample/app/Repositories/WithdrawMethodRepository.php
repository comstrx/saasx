<?php

namespace App\Repositories;
use App\Models\WithdrawMethod;

class WithdrawMethodRepository extends BaseRepository {

    public function __construct ( WithdrawMethod $model ) { parent::__construct($model); }

    public function fields ( array $data = [] ) {
        
        return [
            'code'        => string(data_get($data, 'code')),
            'currency'    => string(data_get($data, 'currency')),
            'notes'       => string(data_get($data, 'notes')),
            'min_amount'  => float(data_get($data, 'min_amount')),
            'max_amount'  => float(data_get($data, 'max_amount')),
            'tax_value'   => float(data_get($data, 'tax_value')),
            'tax_rate'    => float(data_get($data, 'tax_rate')),
            'fields'      => data_get($data, 'fields'),
            'name'        => data_get($data, 'name'),
            'description' => data_get($data, 'description'),
        ];

    }

}
