<?php

$BASE_DOMAIN = env('BASE_DOMAIN');

return [
    'admins' => [
        'super' => [
            'name'     => env('APP_ADMIN_NAME', 'Super Admin'),
            'phone'    => env('APP_ADMIN_PHONE', '+1 000-111-0001'),
            'email'    => env('APP_ADMIN_EMAIL', 'admin@gmail.com'),
            'password' => env('APP_ADMIN_PASSWORD', 'password'),
        ],
    ],
    'domains' => [
        'base'      => ['name' => $BASE_DOMAIN],
        'client'    => ['name' => env('APP_CLIENT_DOMAIN', "www.{$BASE_DOMAIN}")],
        'admin'     => ['name' => env('APP_ADMIN_DOMAIN', "admin.{$BASE_DOMAIN}")],
        'vendor'    => ['name' => env('APP_VENDOR_DOMAIN', "vendor.{$BASE_DOMAIN}")],
        'delivery'  => ['name' => env('APP_DELIVERY_DOMAIN', "delivery.{$BASE_DOMAIN}")],
        'affiliate' => ['name' => env('APP_AFFILIATE_DOMAIN', "affiliate.{$BASE_DOMAIN}")],
        'blog'      => ['name' => env('APP_BLOG_DOMAIN', "blog.{$BASE_DOMAIN}")],
        'app'       => ['name' => env('APP_APP_DOMAIN', "app.{$BASE_DOMAIN}")],
        'api'       => ['name' => env('APP_API_DOMAIN', "api.{$BASE_DOMAIN}")],
        'cdn'       => ['name' => env('APP_CDN_DOMAIN', "cdn.{$BASE_DOMAIN}")],
        'local'     => ['name' => env('APP_LOCAL_DOMAIN', 'localhost')],
        'ip'        => ['name' => env('APP_LOCAL_IP_DOMAIN', '127.0.0.1')],
    ],
    'vercel' => [
        'token' => env('VERCEL_API_TOKEN'),
        'ip'    => env('VERCEL_IP_HOST'),
        'cname' => env('VERCEL_DNS_CNAME'),

        'projects' => [
            'client'   => ['id' => env('VERCEL_CLIENT_PROJECT')],
            'admin'    => ['id' => env('VERCEL_ADMIN_PROJECT')],
            'vendor'   => ['id' => env('VERCEL_VENDOR_PROJECT')],
            'delivery' => ['id' => env('VERCEL_DELIVERY_PROJECT')],
            'blog'     => ['id' => env('VERCEL_BLOG_PROJECT')],
        ]
    ],
    'cloudflare' => [
        'token'  => env('CLOUDFLARE_API_TOKEN'),
        'domain' => [
            'id'  => env('CLOUDFLARE_DOMAIN_ID'),
            'ns1' => env('CLOUDFLARE_DOMAIN_NS1'),
            'ns2' => env('CLOUDFLARE_DOMAIN_NS2')
        ],
    ],
];
