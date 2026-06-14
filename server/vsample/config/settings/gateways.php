<?php

return [
    'paypal' => [
        'name'               => 'paypal',
        'type'               => 'wallet',
        'country'            => 'EG',
        'language'           => 'en',
        'currency'           => 'USD',
        'min_deposit_value'  => 1,
        'min_withdraw_value' => 10,
        'max_deposit_value'  => 10000,
        'max_withdraw_value' => 5000,
        'deposit_tax_value'  => 0.5,
        'deposit_tax_rate'   => 5,
        'withdraw_tax_value' => 0.5,
        'withdraw_tax_rate'  => 0,
        'refund_days'        => 15,
        'allow_deposit'      => true,
        'allow_withdraw'     => true,
        'allow_refund'       => true,
        'allow_pay'          => true,
        'sandbox'            => false,
        'active'             => true,
        'credentials'        => [
            'api_url'       => null,
            'app_id'        => null,
            'client_id'     => null,
            'client_secret' => null
        ],
        'webhooks'           => [
            'deposit'  => ['id' => null, 'secret' => null],
            'withdraw' => ['id' => null, 'secret' => null],
            'refund'   => ['id' => null, 'secret' => null]
        ],
    ],
    'stripe' => [
        'name'               => 'stripe',
        'type'               => 'visa',
        'country'            => 'EG',
        'language'           => 'en',
        'currency'           => 'USD',
        'min_deposit_value'  => 1,
        'min_withdraw_value' => 10,
        'max_deposit_value'  => 10000,
        'max_withdraw_value' => 5000,
        'deposit_tax_value'  => 0.5,
        'deposit_tax_rate'   => 2.5,
        'withdraw_tax_value' => 0.5,
        'withdraw_tax_rate'  => 0,
        'refund_days'        => 15,
        'allow_deposit'      => true,
        'allow_withdraw'     => true,
        'allow_refund'       => true,
        'allow_pay'          => true,
        'sandbox'            => false,
        'active'             => true,
        'credentials'        => [
            'api_url'    => null,
            'public_key' => null,
            'secret_key' => null
        ],
        'webhooks'           => [
            'deposit'  => ['id' => null, 'secret' => null],
            'withdraw' => ['id' => null, 'secret' => null],
            'refund'   => ['id' => null, 'secret' => null]
        ],
    ],
];
