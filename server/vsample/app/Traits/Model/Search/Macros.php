<?php

namespace App\Traits\Model\Search;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Illuminate\Support\Arr;

trait Macros {

    use Helpers, Statistics, Scopes;

    protected static function bootMacros () {

        Builder::macro('getResult',      function ( ...$params ) { return $this->getModel()->getResult($this, ...$params) ;});
        Builder::macro('getFirst',       function ( ...$params ) { return $this->getModel()->getFirst($this, ...$params); });
        Builder::macro('getFirstOrFail', function ( ...$params ) { return $this->getModel()->getFirstOrFail($this, ...$params); });
        Builder::macro('getRaw',         function ( ...$params ) { return $this->getModel()->getRaw($this, ...$params); });
        Builder::macro('findResource',   function ( ...$params ) { return $this->getModel()->findResource($this, ...$params); });
        Builder::macro('getResource',    function ( ...$params ) { return $this->getModel()->getResource($this, ...$params); });
        Builder::macro('getArray',       function ( ...$params ) { return $this->getModel()->getArray($this, ...$params); });
        Builder::macro('getIds',         function ( ...$params ) { return $this->getModel()->getIds($this, ...$params); });
        Builder::macro('getItems',       function ( ...$params ) { return $this->getModel()->getItems($this, ...$params); });
        Builder::macro('getStats',       function ( ...$params ) { return $this->getModel()->getStats($this, ...$params); });

    }
    protected function applyPermissions ( Model $item = null ) {

        if ( !$item || empty($this->getPermissions()) ) return $item;

        $permissions = collect($this->getPermissions())->mapWithKeys(fn($value, $key) =>
            is_string($key) ? [$key => $value ?? true] : [$value => true]
        );

        $allowed = $permissions->filter(fn($v) => $v)->keys()->all();
        $denied  = $permissions->filter(fn($v) => !$v)->keys()->all();

        return $item->has(...$allowed) && $item->notHas(...$denied) ? $item : null;

    }
    public function getResult ( Builder $query ) {

        $items = $query->get();
        return $items->filter(fn($item) => $this->applyPermissions($item))->values();

    }
    public function getFirst ( Builder $query, int $id = null ) {

        $item = $query->when($id, fn($q) => $q->where('id', $id))->first();
        return $this->applyPermissions($item);

    }
    public function getFirstOrFail ( Builder $query, int $id = null ) {

        $item = $query->when($id, fn($q) => $q->where('id', $id))->firstOrFail();
        return $this->applyPermissions($item) ?? $item->failNow();

    }
    public function getRaw ( Builder $query, array $meta = [] ) {

        return ['items' => $query->getResult(), 'meta' => array_merge($this->getMeta(), $meta)];

    }
    public function findResource ( Builder $query, int $id = null, string $resource = null ) {

        if ( !$id ) return $query->getResource($resource, true);
        
        $resource = $resource ?? $query->getModel()->getResourceClass();
        return ['item' => $resource::make( $query->getFirstOrFail($id) )->toArray(request())];

    }
    public function getResource ( Builder $query, string $resource = null, bool $one = false ) {

        [$raw, $resource] = [$query->getRaw(), $resource ?? $query->getModel()->getResourceClass()];

        if ( $one ) $raw = ['item' => $resource::make($raw['items'][0] ?? null)->toArray(request())];
        else $raw['items'] = $resource::collection($raw['items'])->toArray(request());

        return $raw;

    }
    public function getArray ( Builder $query ) {

        return $this->getResult($query)->map(fn($item) => $item->toArray())->all();
        
    }
    public function getIds ( Builder $query ) {

        return $this->getResult($query)->pluck('id')->all();
        
    }
    public function getItems ( Builder $query, string $resource = null ) {

        return $this->getResource($query, $resource)['items'] ?? [];
        
    }
    public function getStats ( Builder $query, array $options = [] ) {

        return $this->statistics($query, $options);

    }

    public static function resolveMeta ( array $metaList = [] ) {

        return [
            ...(collect($metaList)->first() ?? []),
            'limit' => collect($metaList)->pluck('limit')->sum(),
            'total' => collect($metaList)->pluck('total')->sum()
        ];

    }
    public static function getResultMany ( array $queries = [] ) {

        $items = collect($queries)->flatMap(fn($q) => $q->getResult())->filter();

        $items = in_array(trim(strtolower((string) request('sort'))), ['oldest','created_at@asc'])
            ? $items->sortBy(fn($r) => $r->created_at)->values()
            : $items->sortByDesc(fn($r) => $r->created_at)->values();

        return $items;

    }
    public static function getRawMany ( array $queries = [] ) {

        $chunks = collect($queries)->map(fn($q) => $q->getRaw())->filter();

        $items = $chunks->pluck('items')->flatten(1);
        $meta  = static::resolveMeta($chunks->pluck('meta')->all());

        $items = in_array(trim(strtolower((string) data_get($meta, 'sort'))), ['oldest','created_at@asc'])
            ? $items->sortBy(fn($r) => $r->created_at)->values()
            : $items->sortByDesc(fn($r) => $r->created_at)->values();

        return ['items' => $items, 'meta' => $meta];

    }
    public static function getResourceMany ( array $queries = [] ) {

        $chunks = collect($queries)->map(fn($query) => $query->getResource());

        $items = $chunks->pluck('items')->flatten(1);
        $meta  = static::resolveMeta($chunks->pluck('meta')->all());

        $items = in_array(trim(strtolower((string) data_get($meta, 'sort'))), ['oldest','created_at@asc'])
            ? $items->sortBy(fn($r) => $r['created_at'])->values()
            : $items->sortByDesc(fn($r) => $r['created_at'])->values();

        return ['items' => $items->all(), 'meta' => $meta];

    }
    public static function getItemsMany ( array $queries = [] ) {

        return static::getResourceMany($queries)['items'] ?? [];
        
    }
    public static function getStatsMany ( array $queries = [], array $options = [] ) {

        $items = collect($queries)->map(fn($query) => (new static)->statistics($query, $options));

        $data = $items->pluck('data')->reduce(fn($value, $key) =>
            $value === null ? $key : array_map(fn($x, $y) => $x + $y, $value, $key), null
        );

        return [...$items->first(), 'total' => $items->sum('total'), 'data' => $data];

    }

}
