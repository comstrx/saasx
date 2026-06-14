<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use App\Exceptions\JsonExceptionHandler;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        apiPrefix: '',
    )
    ->withBroadcasting(
        __DIR__.'/../routes/channels.php',
        ['middleware' => ['api', 'auth:sanctum']],
    )
    ->withMiddleware(function ( Middleware $middleware ) {

        $middleware->alias([
            'store' => \App\Http\Middleware\Store::class,
            'role'  => \App\Http\Middleware\Role::class,
            'has'  => \App\Http\Middleware\Has::class,
        ]);

    })
    ->withExceptions(function ( Exceptions $exceptions ) {
        $exceptions->renderable(fn ( Throwable $e ) => JsonExceptionHandler::handle($e->getPrevious() ?? $e));
    })->create();
