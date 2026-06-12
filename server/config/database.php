<?php

use Illuminate\Support\Str;

$redis = static fn (int|string $database): array => [
    'database'          => $database,
    'url'               => env('REDIS_URL'),
    'host'              => env('REDIS_HOST', '127.0.0.1'),
    'username'          => env('REDIS_USERNAME'),
    'password'          => env('REDIS_PASSWORD'),
    'port'              => env('REDIS_PORT', '6379'),
    'max_retries'       => (int) env('REDIS_MAX_RETRIES', 3),
    'backoff_base'      => (int) env('REDIS_BACKOFF_BASE', 100),
    'backoff_cap'       => (int) env('REDIS_BACKOFF_CAP', 1000),
    'backoff_algorithm' => env('REDIS_BACKOFF_ALGORITHM', 'decorrelated_jitter'),
];

return [

    'default' => env('DB_CONNECTION', 'pgsql'),

    'connections' => [

        'pgsql' => [
            'driver'         => 'pgsql',
            'url'            => env('DB_URL'),
            'host'           => env('DB_HOST', '127.0.0.1'),
            'port'           => env('DB_PORT', '5432'),
            'database'       => env('DB_DATABASE', 'laravel'),
            'username'       => env('DB_USERNAME', 'postgres'),
            'password'       => env('DB_PASSWORD', ''),
            'charset'        => env('DB_CHARSET', 'utf8'),
            'sslmode'        => env('DB_SSLMODE', 'require'),
            'search_path'    => env('DB_SEARCH_PATH', 'public'),
            'prefix'         => '',
            'prefix_indexes' => true,
        ],

    ],

    'migrations' => [
        'table' => 'migrations',
        'update_date_on_publish' => true,
    ],

    'redis' => [

        'client' => env('REDIS_CLIENT', 'phpredis'),

        'options' => [
            'cluster'    => env('REDIS_CLUSTER', 'redis'),
            'prefix'     => env('REDIS_PREFIX', Str::slug((string) env('APP_NAME', 'laravel')).'-database-'),
            'persistent' => (bool) env('REDIS_PERSISTENT', false),
        ],

        'default'    => $redis(env('REDIS_DB', '0')),
        'cache'      => $redis(env('REDIS_CACHE_DB', '1')),
        'queue'      => $redis(env('REDIS_QUEUE_DB', '2')),
        'horizon'    => $redis(env('REDIS_HORIZON_DB', '3')),
        'reverb'     => $redis(env('REDIS_REVERB_DB', '4')),
        'session'    => $redis(env('REDIS_SESSION_DB', '5')),
        'rate_limit' => $redis(env('REDIS_RATE_LIMIT_DB', '6')),
        'lock'       => $redis(env('REDIS_LOCK_DB', '7')),

    ],

];
