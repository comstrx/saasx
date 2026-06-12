<?php

use Illuminate\Support\Str;

return [

    'domain' => env('HORIZON_DOMAIN'),

    'path' => env('HORIZON_PATH', 'horizon'),

    'use' => env('HORIZON_REDIS_CONNECTION', 'horizon'),

    'middleware' => ['web'],

    'fast_termination' => true,

    'memory_limit' => (int) env('HORIZON_MEMORY_LIMIT', 256),

    'prefix' => env('HORIZON_PREFIX', Str::slug((string) env('APP_NAME', 'laravel')).'-horizon:'),

    'waits' => [
        'redis:critical' => 30,
        'redis:default' => 60,
        'redis:media' => 120,
        'redis:notifications' => 60,
    ],

    'trim' => [
        'recent' => 60,
        'pending' => 60,
        'completed' => 60,
        'recent_failed' => 10080,
        'failed' => 10080,
        'monitored' => 10080,
    ],

    'silenced' => [],

    'metrics' => [
        'trim_snapshots' => [
            'job' => 24,
            'queue' => 24,
        ],
    ],

    'defaults' => [
        'critical' => [
            'connection' => 'redis',
            'queue' => ['critical'],
            'balance' => 'auto',
            'autoScalingStrategy' => 'time',
            'maxProcesses' => 2,
            'maxTime' => 0,
            'maxJobs' => 500,
            'memory' => 256,
            'tries' => 3,
            'timeout' => 60,
            'nice' => 0,
        ],
        'default' => [
            'connection' => 'redis',
            'queue' => ['default'],
            'balance' => 'auto',
            'autoScalingStrategy' => 'time',
            'maxProcesses' => 4,
            'maxTime' => 0,
            'maxJobs' => 500,
            'memory' => 256,
            'tries' => 3,
            'timeout' => 90,
            'nice' => 0,
        ],
        'media' => [
            'connection' => 'redis',
            'queue' => ['media'],
            'balance' => 'auto',
            'autoScalingStrategy' => 'time',
            'maxProcesses' => 2,
            'maxTime' => 0,
            'maxJobs' => 100,
            'memory' => 512,
            'tries' => 2,
            'timeout' => 600,
            'nice' => 5,
        ],
        'notifications' => [
            'connection' => 'redis',
            'queue' => ['notifications', 'emails'],
            'balance' => 'auto',
            'autoScalingStrategy' => 'time',
            'maxProcesses' => 3,
            'maxTime' => 0,
            'maxJobs' => 500,
            'memory' => 256,
            'tries' => 3,
            'timeout' => 90,
            'nice' => 0,
        ],
    ],

    'environments' => [
        'production' => [
            'critical' => [
                'maxProcesses' => (int) env('HORIZON_CRITICAL_MAX_PROCESSES', 4),
                'balanceMaxShift' => 1,
                'balanceCooldown' => 3,
            ],
            'default' => [
                'maxProcesses' => (int) env('HORIZON_DEFAULT_MAX_PROCESSES', 10),
                'balanceMaxShift' => 1,
                'balanceCooldown' => 3,
            ],
            'media' => [
                'maxProcesses' => (int) env('HORIZON_MEDIA_MAX_PROCESSES', 4),
                'balanceMaxShift' => 1,
                'balanceCooldown' => 5,
            ],
            'notifications' => [
                'maxProcesses' => (int) env('HORIZON_NOTIFICATIONS_MAX_PROCESSES', 6),
                'balanceMaxShift' => 1,
                'balanceCooldown' => 3,
            ],
        ],
        'local' => [
            'critical' => ['maxProcesses' => 1],
            'default' => ['maxProcesses' => 2],
            'media' => ['maxProcesses' => 1],
            'notifications' => ['maxProcesses' => 1],
        ],
        '*' => [
            'critical' => ['maxProcesses' => 2],
            'default' => ['maxProcesses' => 3],
            'media' => ['maxProcesses' => 1],
            'notifications' => ['maxProcesses' => 2],
        ],
    ],

];
