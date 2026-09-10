<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class HorizonBasicAuth
{
    /**
     * Admit only the credentials the environment names; with no password set, nobody gets in.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = (string) config('horizon.basic.user');
        $password = (string) config('horizon.basic.password');

        if ($password === '' || ! hash_equals($user, (string) $request->getUser()) || ! hash_equals($password, (string) $request->getPassword())) {
            return response('Unauthorized', 401, ['WWW-Authenticate' => 'Basic realm="horizon"']);
        }

        return $next($request);
    }
}
