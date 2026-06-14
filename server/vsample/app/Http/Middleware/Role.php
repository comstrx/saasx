<?php

namespace App\Http\Middleware;
use Illuminate\Http\Request;
use Closure;

class Role {

    public function handle ( Request $request, Closure $next, string $role ) {

        return user()?->hasRole($role) && user()?->active ? $next($request) : middlewareFailed();

    }

}
