<?php

use Illuminate\Support\Facades\DB;

function cache_time ( int $minutes = null ) {

    return now()->addMinutes($minutes ?? 5);

}
function cache_tags ( array $tags = [] ) {

    return array_merge([
        'store:' . store_id(),
        'locale:' . app()->getLocale(),
        'read_only:' . bool(request()->input('read_only')),
    ], $tags);

}
function delete_cache ( string|array $tags = null ) {

    return cache()->tags(cache_tags((array) $tags))->flush();

}
function update_cache ( string|array $tags = null, string $key = null, $data = null ) {

    delete_cache($tags);
    if ( $data ) return cache()->tags(cache_tags((array) $tags))->put(string($key), $data, cache_time());

}
function remember ( string|array $tags = null, string $key = null, int $minutes = null, callable $callback = null ) {

    if ( config('app.env') === 'local' ) return $callback();
    return cache()->tags(cache_tags((array) $tags))->remember(string($key), cache_time($minutes), $callback);

}
function rememberWithLock ( string $key, int $ttlSeconds, int $lockSeconds, callable $callback, mixed $fallback = null ): mixed {

    $cache = Cache::get($key);

    if ( $cache !== null ) return $cache;

    $lock = Cache::lock("lock:$key", $lockSeconds);

    try {
        if ($lock->get()) {
            $data = call_user_func($callback);
            Cache::put($key, $data, $ttlSeconds);
            return $data;
        }

        // fallback while lock is active
        return $fallback ?? Cache::get($key);

    } catch (LockTimeoutException $e) {
        Log::warning("Lock timeout for cache key: $key");
        return $fallback ?? null;

    } finally {
        optional($lock)->release();
    }

}
function rememberForever ( string $tag = null, string $key = null, callable $callback ) {

    return cache()->tags(['forevercache', $tag])->rememberForever(string($key), $callback);

}
function getDatabaseTables () {

    return rememberForever('database', 'tables', function () {
        $databaseName = DB::getDatabaseName();
        return array_map(fn($table) => $table->{"Tables_in_{$databaseName}"}, DB::select('SHOW TABLES'));
    });

}
function getDatabaseSchema () {

    return rememberForever('database', 'schema', function () {

        $schema = collect(getDatabaseTables())->map(fn ($table) => [
            $table => collect(DB::select("SHOW COLUMNS FROM {$table}"))->mapWithKeys(function ($col) {
                return [$col->Field => $col->Type];
            })->toArray()
        ])->values();
    
        return collect($schema)->flatMap(fn($item) => $item)->toArray();

    });

}
function getTablecolumns ( string $table ) {

    return array_keys(getDatabaseSchema()[$table] ?? []);
    
}
function tableHasColumn ( string $table, string $column = null ) {

    return isset(getDatabaseSchema()[$table][$column]);
    
}
function getColumnType ( string $table, string $column = null ) {

    return getDatabaseSchema()[$table][$column] ?? null;

}
