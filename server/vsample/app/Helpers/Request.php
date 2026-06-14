<?php

use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Str;
use App\Models\Setting;
use App\Models\SiteInfo;
use App\Models\Store;
use App\Models\User;

function user () {

    static $user;
    if ( forced_user_exists() ) return forced_user();

    if ( config('app.env') === 'local' ) return $user ??= User::role(in_array('admin', request()->segments()) ? 'admin' : 'client')->first();
    return $user ??= auth()->user() ?? auth('sanctum')->user();

}
function user_id () {

    return user()?->id ?? 0;

}
function user_email () {

    return user()?->email ?? null;

}
function user_role () {

    return user()?->role ?? null;

}
function user_wallet () {

    return user()?->wallet ?? null;
    
}
function client () {

    $user = user();
    $userId = integer(request()->route('user')) ?: integer(request()->input('user_id'));
    if ( !$user ) return null;
    
    if ( $user->hasRole('client') ) return $user;
    if ( !$userId ) return null;

    $user = User::find($userId);
    if ( !$user?->hasRole('client') ) return null;
    
    return $user;

}
function client_id () {

    return client()?->id ?? 0;

}
function is_super () {

    return bool(user()?->hasRole('admin')) && bool(user()?->has('super'));

}
function is_supervisor () {

    return bool(user()?->hasRole('admin')) && bool(user()?->has('supervisor'));

}
function is_admin () {

    return bool(user()?->hasRole('admin'));

}
function is_vendor () {

    return bool(user()?->hasRole('vendor'));

}
function is_client () {

    return bool(user()?->hasRole('client'));

}
function user_store_id () {

    return user()?->store_id ?? null;

}

function set_forced_user ( mixed $user ) {
    
    $user = is_int($user) ? User::find($user) : $user;

    app()->instance('user', $user);
    app()->instance('user.set', true);
    
    return $user;

}
function unset_forced_user () {

    app()->forgetInstance('user');
    app()->forgetInstance('user.set');

}
function forced_user_exists () {

    return app()->bound('user.set');

}
function forced_user () {

    return app()->bound('user') ? app('user') : null;

}

function site_info ( int $storeId = null ) {

    $storeId = $storeId ?? store_id();

    return remember('model:siteInfo', "public_{$storeId}", 60, fn() =>
        SiteInfo::withoutTenant()->active()->firstWhere('store_id', $storeId)
    );

}
function set_real_store ( mixed $store ) {

    $store = is_int($store) ? Store::find($store) : $store;
    app()->instance('store.real', $store);
    return set_store($store);

}
function real_store () {

    return app()->bound('store.real') ? app('store.real') : null;

}
function real_store_id () {

    return real_store()?->id ?? 0;

}
function set_store ( mixed $store ) {
    
    $store = is_int($store) ? Store::find($store) : $store;
    app()->instance('store', $store);
    return $store;

}
function unset_store () {

    app()->forgetInstance('store');

}
function store () {
    
    return app()->bound('store') ? app('store') : null;

}
function store_parent () {

    return store()?->parent ?? null;
    
}
function store_admin () {

    return User::withoutTenant()->where('store_id', store_id())->where('role', 'admin')->first()?->ifHas('super');

}
function store_owner () {

    return User::withoutTenant()->where('id', store()?->owner_id ?? 0)->first();

}
function store_id () {
    
    return store()?->id ?? 0;

}
function store_parent_id () {

    return store()?->parent_id ?? 0;
    
}
function store_admin_id () {

    return store_admin()?->id ?? 0;
    
}
function store_owner_id () {

    return store_owner()?->id ?? 0;
    
}
function with_store ( mixed $store, mixed $user = null, callable $callback = null ) {

    $current = store();
    set_store($store);

    if ( $user ) set_forced_user($user);

    try{ return $callback ? $callback() : null; }
    finally{ set_store($current); unset_forced_user(); }

}

function user_has ( ...$permissions ) {

    return user()?->has(...$permissions);

}
function setting_has ( ...$permissions ) {

    $permissions = array_map(fn($perm) => 'allow_' . Str::after($perm, '_'), $permissions);
    return Setting::hasPermission(...$permissions);

}
function store_has ( ...$permissions ) {

    $parent = remember('model:store', 'store_parent_' . store_id(), 60, fn() => store_parent());
    
    $permissions = array_map(fn($perm) => 'allow_' . Str::after($perm, '_'), $permissions);
    return !$parent ? true : with_store($parent, callback: fn() => Store::hasPermission(...$permissions));

}
function middleware_has ( string $permission ) {

    $permission = Str::plural(Str::snake(str_replace("{related}", request()->route('related') ?? '', $permission)));
    $permission = str_contains($permission, 'admins') ? 'supervisor' : $permission;

    if ( is_admin() ) return (is_super() || user_has($permission)) && store_has($permission);
    return user_has($permission) && setting_has($permission) && store_has($permission);

}

function limiter ( int $limit = 5, string $name = null, int $minutes = 1 ) {

    $name = $name ?: 'limit_' . md5("{$limit}_{$minutes}");
    $key  = "{$name}:" . store_id() . ":" . (user_id() ?: request()->ip());

    if ( RateLimiter::tooManyAttempts($key, $limit) ) abort(429);
    else RateLimiter::hit($key, $minutes * 60);

    return true;

}
function rateLimiter ( int $limit = null, int $minutes = 1 ) {

    $limit = $limit ?? (is_admin() ? 600 : 60);
    return "throttle:{$limit},{$minutes}";

}
function tenantMiddleware ( int $limit = null ) {

    return ['store', rateLimiter($limit)];

}
function authMiddleware ( string $role = 'client', int $limit = null ) {

    if ( config('app.env') === 'local' ) return ["role:{$role}", 'has:allow_logins', rateLimiter($limit)];
    return ['auth:sanctum', "role:{$role}", 'has:allow_logins', rateLimiter($limit)];

}
