<?php

return [

    'default' => env('REVERB_SERVER', 'reverb'),

    'servers' => [

        'reverb' => [
            'host' => env('REVERB_SERVER_HOST', '0.0.0.0'),
            'port' => env('REVERB_SERVER_PORT', 8080),
            'hostname' => env('REVERB_HOST'),

            'options' => [
                'tls' => [],
            ],

            'max_request_size' => (int) env('REVERB_MAX_REQUEST_SIZE', 10485760),

            'scaling' => [
                'enabled' => (bool) env('REVERB_SCALING_ENABLED', true),
                'channel' => env('REVERB_SCALING_CHANNEL', 'reverb'),
                'server' => [
                    'url' => env('REDIS_URL'),
                    'host' => env('REDIS_HOST', '127.0.0.1'),
                    'port' => env('REDIS_PORT', '6379'),
                    'username' => env('REDIS_USERNAME'),
                    'password' => env('REDIS_PASSWORD'),
                    'database' => env('REDIS_REVERB_DB', '4'),
                ],
            ],
        ],

    ],

    'apps' => [

        'provider' => 'config',

        'apps' => [
            [
                'key' => env('REVERB_APP_KEY'),
                'secret' => env('REVERB_APP_SECRET'),
                'app_id' => env('REVERB_APP_ID'),

                'options' => [
                    'host' => env('REVERB_HOST'),
                    'port' => env('REVERB_PORT', 443),
                    'scheme' => env('REVERB_SCHEME', 'https'),
                    'useTLS' => env('REVERB_SCHEME', 'https') === 'https',
                ],

                'allowed_origins' => array_values(array_filter(array_map(
                    'trim', explode(',', (string) env('REVERB_ALLOWED_ORIGINS', '*'))
                ))),

                'ping_interval' => (int) env('REVERB_APP_PING_INTERVAL', 60),

                'max_message_size' => (int) env('REVERB_APP_MAX_MESSAGE_SIZE', 1048576),
            ],
        ],

    ],

];
