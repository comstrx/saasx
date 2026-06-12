<?php

return [

    'paths' => ['*'],

    'allowed_methods' => ['*'],
    'allowed_origins' => ['*'],

    'allowed_origins_patterns' => [],

    'allowed_headers' => [
        'Accept',
        'Accept-Language',
        'Authorization',
        'Content-Type',
        'Content-Language',
        'X-Requested-With',
        'X-Request-Id',
        'X-Correlation-Id',
        'X-Language',
        'X-Tenant',
        'X-Api-Key',
        'X-Api-Secret',
        'X-Signature',
        'X-Timestamp',
        'Idempotency-Key',
        'X-Nonce',
    ],

    'exposed_headers' => [
        'X-Request-Id',
        'X-Correlation-Id',
        'X-RateLimit-Limit',
        'X-RateLimit-Remaining',
        'X-RateLimit-Reset',
        'X-Language',
        'Retry-After',
        'Link',
        'Location',
        'Idempotency-Key',
        'Idempotency-Replayed',
    ],

    'max_age' => (int) env('CORS_MAX_AGE', 86400),

    'supports_credentials' => false,

];
