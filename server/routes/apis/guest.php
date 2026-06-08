<?php

use Illuminate\Support\Facades\Route;

Route::get('/health', function () {
    return response()->json(['ok' => true, 'runtime' => 'octane', 'server' => 'openswoole']);
});
