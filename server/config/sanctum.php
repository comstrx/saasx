<?php

return [

    'stateful' => [],

    'guard' => ['web'],

    'expiration' => (int) env('SANCTUM_TOKEN_EXPIRATION', 10080),

    'token_prefix' => env('SANCTUM_TOKEN_PREFIX', ''),

];
