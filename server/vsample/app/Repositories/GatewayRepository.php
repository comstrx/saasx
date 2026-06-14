<?php

namespace App\Repositories;
use App\Http\Resources\GatewayResource;
use App\Models\Gateway;

class GatewayRepository extends BaseRepository {

    public function __construct( Gateway $model ) { parent::__construct($model); }

    public function fields ( array $data = [] ) {

        return [
            'name'               => string(data_get($data, 'name')),
            'type'               => string(data_get($data, 'type')),
            'country'            => string(data_get($data, 'country')),
            'currency'           => string(data_get($data, 'currency')),
            'language'           => string(data_get($data, 'language')),
            'description'        => string(data_get($data, 'description')),
            'notes'              => string(data_get($data, 'notes')),
            'min_deposit_value'  => float(data_get($data, 'min_deposit_value')),
            'max_deposit_value'  => float(data_get($data, 'max_deposit_value')),
            'min_withdraw_value' => float(data_get($data, 'min_withdraw_value')),
            'max_withdraw_value' => float(data_get($data, 'max_withdraw_value')),
            'deposit_tax_value'  => float(data_get($data, 'deposit_tax_value')),
            'withdraw_tax_value' => float(data_get($data, 'withdraw_tax_value')),
            'deposit_tax_rate'   => float(data_get($data, 'deposit_tax_rate')),
            'withdraw_tax_rate'  => float(data_get($data, 'withdraw_tax_rate')),
            'refund_days'        => integer(data_get($data, 'refund_days')),
            'allow_deposit'      => bool(data_get($data, 'allow_deposit')),
            'allow_withdraw'     => bool(data_get($data, 'allow_withdraw')),
            'allow_refund'       => bool(data_get($data, 'allow_refund')),
            'allow_pay'          => bool(data_get($data, 'allow_pay')),
            'sandbox'            => bool(data_get($data, 'sandbox')),
            'credentials'        => data_get($data, 'credentials'),
            'webhooks'           => data_get($data, 'webhooks'),
        ];

    }
    public function findByName ( string $name, int $store_id = null ) {

        return parent::query()
            ->where('name', $name)
            ->when(isset($store_id), fn($q) => $q->where('store_id', $store_id))
            ->active()
            ->first();

    }
    public function baseCurrency () {

        return 'USD';

    }
    public function fixProcess ( string $process ) {

        return match ( $process ) { 'deposit' => 'deposit', 'pay' => 'deposit', 'withdraw' => 'withdraw', 'refund' => 'withdraw' };

    }
    public function validateProcess ( Gateway $gateway, string $process ) {
        
        return $gateway->active && $gateway->{"allow_{$process}"};
    
    }
    public function validateAmount ( Gateway $gateway, float $amount, string $process ) {
        
        $process = $this->fixProcess($process);
        return $amount >= $gateway->{"min_{$process}_value"} && $amount <= $gateway->{"max_{$process}_value"};
    
    }
    public function calculateTax ( Gateway $gateway, float $amount, string $process ) {
        
        $process = $this->fixProcess($process);
        return ($gateway->{"{$process}_tax_value"} ?? 0) + ($amount * ($gateway->{"{$process}_tax_rate"} ?? 0) / 100);
    
    }
    public function withTax ( Gateway $gateway, float $amount, string $process ) {
        
        $amount  = positive($amount);
        $tax     = positive($this->calculateTax($gateway, $amount, $process));
        return $this->fixProcess($process) === 'withdraw' ? positive($amount - $tax) : positive($amount + $tax);
    
    }
    public function exchange ( Gateway $gateway, float $amount ) {

        $data = [positive($amount), 0];
        if ( strtoupper($gateway->currency) === $this->baseCurrency() ) return $data;

        $data = exchange($amount, $this->baseCurrency(), $gateway->currency);
        return [positive($data['amount'] ?? 0), $data['rate'] ?? 0];

    }

}
