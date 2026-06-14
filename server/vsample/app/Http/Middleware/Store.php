<?php

namespace App\Http\Middleware;
use Illuminate\Http\Request;
use App\Services\StoreService;
use Closure;

class Store {

    public function __construct( protected StoreService $storeService ) {}

    public function handle( Request $request, Closure $next ) {

        $key   = sprintf('store:%s_%s', md5(host()), user_store_id() ?? 'guest');
        $store = remember('store:middleware', $key, 60, fn() => $this->storeService->middleware(host(), user()));

        return set_real_store($store) ? $next($request) : notFoundFailed('Store');

    }

}
