<?php

return [

    'default' => env('FILESYSTEM_DISK', 'local'),

    'disks' => [

        'local' => [
            'driver' => 'local',
            'root' => storage_path('app/private'),
            'serve' => false,
            'throw' => true,
            'report' => false,
        ],

        'public' => [
            'driver' => 'local',
            'root' => storage_path('app/public'),
            'url' => rtrim(env('APP_URL', 'http://localhost'), '/').'/storage',
            'visibility' => 'public',
            'throw' => true,
            'report' => false,
        ],

        's3' => [
            'driver' => 's3',
            'key' => env('AWS_ACCESS_KEY_ID'),
            'secret' => env('AWS_SECRET_ACCESS_KEY'),
            'region' => env('AWS_DEFAULT_REGION'),
            'bucket' => env('AWS_BUCKET'),
            'url' => env('AWS_URL'),
            'endpoint' => env('AWS_ENDPOINT'),
            'use_path_style_endpoint' => (bool) env('AWS_USE_PATH_STYLE_ENDPOINT', false),
            'throw' => true,
            'report' => false,
        ],

        'minio' => [
            'driver' => 's3',
            'key' => env('MINIO_ACCESS_KEY_ID', env('AWS_ACCESS_KEY_ID')),
            'secret' => env('MINIO_SECRET_ACCESS_KEY', env('AWS_SECRET_ACCESS_KEY')),
            'region' => env('MINIO_REGION', env('AWS_DEFAULT_REGION', 'us-east-1')),
            'bucket' => env('MINIO_BUCKET', env('AWS_BUCKET')),
            'url' => env('MINIO_URL'),
            'endpoint' => env('MINIO_ENDPOINT', 'http://127.0.0.1:9000'),
            'use_path_style_endpoint' => true,
            'throw' => true,
            'report' => false,
        ],

    ],

    'links' => [
        public_path('storage') => storage_path('app/public'),
    ],

];
