<?php

return [

    'name' => env('APP_NAME', 'Laravel'),

    'env' => env('APP_ENV', 'production'),

    'debug' => (bool) env('APP_DEBUG', false),

    'url' => env('APP_URL', 'http://localhost'),

    'timezone' => env('APP_TIMEZONE', 'UTC'),

    'locale' => env('APP_LOCALE', 'en'),

    'fallback_locale' => env('APP_FALLBACK_LOCALE', 'en'),

    'faker_locale' => env('APP_FAKER_LOCALE', 'en_US'),

    'cipher' => env('APP_CIPHER', 'AES-256-GCM'),

    'key' => env('APP_KEY'),

    'previous_keys' => array_filter(array_map('trim', explode(',', (string) env('APP_PREVIOUS_KEYS', '')))),

    'maintenance' => [
        'driver' => env('APP_MAINTENANCE_DRIVER', 'cache'),
        'store' => env('APP_MAINTENANCE_STORE', 'redis'),
    ],

];
