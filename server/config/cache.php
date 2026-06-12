<?php

use Illuminate\Support\Str;

return [

    'default' => env('CACHE_STORE', 'redis'),

    'limiter' => env('CACHE_LIMITER', 'rate_limit'),

    'stores' => [

        'array' => [
            'driver' => 'array',
            'serialize' => false,
        ],

        'redis' => [
            'driver' => 'redis',
            'connection' => env('REDIS_CACHE_CONNECTION', 'cache'),
            'lock_connection' => env('REDIS_CACHE_LOCK_CONNECTION', 'lock'),
        ],

        'rate_limit' => [
            'driver' => 'redis',
            'connection' => env('REDIS_RATE_LIMIT_CONNECTION', 'rate_limit'),
            'lock_connection' => env('REDIS_CACHE_LOCK_CONNECTION', 'lock'),
        ],

    ],

    'prefix' => env('CACHE_PREFIX', Str::slug((string) env('APP_NAME', 'laravel')).'-cache-'),

    'serializable_classes' => false,

];
