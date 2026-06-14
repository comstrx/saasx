<?php

namespace App\Http\Middleware;
use Illuminate\Http\Request;
use Closure;

class Has {

    public function handle ( Request $request, Closure $next, string $permission ) {

        return middleware_has($permission) ? $next($request) : middlewareFailed();

    }

}
