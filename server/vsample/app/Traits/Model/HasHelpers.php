<?php

namespace App\Traits\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;
use Carbon\Carbon;

trait HasHelpers {

    public function getModel () {

        return $this instanceof self ? $this : new static;

    }
    public function getModelId () {
        
        return $this->getKey();

    }
    public function getModelName () {
        
        return lcfirst(class_basename($this));
    
    }
    public function getModelClass ( string|Model $model = null )  {

        return class_exists($model ?? '') ? $model : 'App\\Models\\' . Str::studly(Str::singular($model ?? $this->getModelName()));

    }
    public function getResourceClass () {
        
        return class_exists($class = 'App\\Http\\Resources\\' . class_basename($this) . 'Resource') ? $class : null;
    
    }
    public function getRelatedName () {

        return !$this->related ? strtolower(class_basename($this->related_type ?? '')) : $this->related()->getModel()->getModelName();

    }
    public function getRelatedResource () {

        $resource = !$this->related ? null : $this->related()->getModel()->getResourceClass();
        return !$resource ? ['id' => $this->related_id ?? null] : $resource::info($this->related);

    }
    public function makeRelatedResource () {

        $resource = !$this->related ? null : $this->related()->getModel()->getResourceClass();
        return !$resource ? null : $resource::make($this->related, true);

    }
    public function getTableSchema () {

        return getDatabaseSchema()[$this->getTable()] ?? [];

    }
    public function getTableColumns () {

        return getTablecolumns($this->getTable());
        
    }
    public function getColumnType ( string $column = null ) {

        return getColumnType($this->getTable(), $column);

    }
    public function hasColumn ( string $column = null ) {

        return tableHasColumn($this->getTable(), $column);
        
    }
    public function isDateColumn ( string $columnType = null ) {

        return str_contains($columnType, 'date') || str_contains($columnType, 'time');
        
    }
    public function resolveColumn ( string $column = null ) {

        return str_contains($column, '.') ? $column : "{$this->getTable()}.{$column}";

    }
    public function nullRelation ( string $type = null ) {

        $dummyModel = new class extends Model { public $exists = false; protected $table = 'dummy_null'; };
        $query = $dummyModel->newQuery()->from(DB::raw('(select 1 as id) as dummy_null'))->whereRaw('0=1');

        return match ( Str::lower($type) ) {
            'hasmany' => new HasMany($query, $this, 'id', 'id'),
            'hasone'  => new HasOne($query, $this, 'id', 'id'),
            default   => new BelongsTo($query, $this, 'id', 'id', 'null_relation'),
        };

    }
    public function dbTransaction ( callable $callback, bool $response = true ) {

        $hasProcessing = $this->hasColumn('processing');
        $status = false;

        if ( $hasProcessing && $this->processing ) return $status;
        if ( $hasProcessing ) $this->update(['processing' => true]);

        try { $status = DB::transaction($callback); }
        catch ( \Exception $e ) { report($e); if ( $response ) return throwErrorFailed($e->getMessage()); }
        finally { if ( $hasProcessing ) $this->update(['processing' => false]); }
    
        return $status;
    
    }
    public function failNow ( string $name = null ) {

        failNow($name ?? $this->getModelName());

    }
    public function failPermissionNow () {

        failPermissionNow($this->getModelName());

    }
    public function onlyAttributes ( ...$keys ) {

        return Arr::only($this->getAttributes(), Arr::flatten($keys));

    }
    public function exceptAttributes ( ...$keys ) {

        return Arr::except($this->getAttributes(), Arr::flatten($keys));

    }
    public function resolveRelated ( string|array $data = [], string|array $forbidden = [], bool $all = false ) {

        $relations = [];

        foreach ( (array) $data as $key => $value ) {

            $start    = Str::beforeLast($key, '_id');
            $class    = 'App\\Models\\' . Str::studly($start);
            $relation = ['related_type' => $class, 'related_id' => $value];

            if (
                empty($value) ||
                !Str::endsWith($key, '_id') ||
                !class_exists($class) ||
                in_array($start, (array) $forbidden) ||
                in_array($key, (array) $forbidden)
            ) continue;
            
            if ( $all ) $relations[] = $relation;
            else return $relation;
            
        }

        return $all ? $relations : [];

    }
    public function setTenant ( int $id = null, int $userId = null, callable $callback = null ) {
       
        if ( !$callback ) return null;
        if ( $id === store_id() ) return $callback();

        $current = store_id();
        set_store($id);

        if ( $userId && $id !== real_store_id() ) set_forced_user($userId);

        try { return $callback(); }
        finally { set_store($current); unset_forced_user(); }

    }

    public function utcDate () {

        return Carbon::now('UTC')->format('Y-m-d H:i:s');

    }
    public function formatDate ( string $column = null ) {

        return !isset($this->$column) || is_string($this->$column) ? $this->$column : $this->$column?->format('Y-m-d H:i:s');

    }
    public function localize ( string $column = null, bool $all = false ) {

        if ( $all ) return (object) parse($this->$column);
        return parse($this->$column)[app()->getLocale()] ?? parse($this->$column)['en'] ?? null;

    }
    public function formatDecimal ( string $column = null ) {
        
        return isset($this->$column) ? number_format($this->$column ?? 0, 2, '.', '') : null;

    }
    public function diffDate ( string $prevDate, $nextDate ) {

        $prevDate = Carbon::parse(string($prevDate));
        $nextDate = Carbon::parse(string($nextDate));
        return integer($prevDate->diffInDays($nextDate));

    }

    public function getAllModels () {

        return collect(File::allFiles(app_path('Models')))
            ->filter(fn($f) => $f->getExtension() === 'php')
            ->map(fn($f) => 'App\\Models\\' . $f->getBasename('.php'))
            ->filter(fn($class) => class_exists($class))
            ->values()
            ->all();

    }
    public function resolveModelClass ( string $modelName, string $parent = null ) {

        $model = $this->getModelClass($modelName);
        if ( class_exists($model) ) return $model;

        return match ( strtolower($modelName) ) {
            'parent', 'children', 'childrens', 'replied' => class_exists($parent ?? '') ? $parent : $this->getModelClass(),
            'user', 'owner', 'admin', 'vendor', 'client', 'sender', 'receiver', 'creator', 'referrer', 'referred' => $this->getModelClass('user'),
            default => null,
        };

    }
    public function resolveModelMorphs ( string $model = null ) {

        if ( !class_exists($model ?? '') ) return [];
        $columns = getTablecolumns((new $model)->getTable());

        return collect($columns)
            ->filter(fn($col) => str_ends_with($col, '_type'))
            ->map(fn($col) => Str::beforeLast($col, '_type'))
            ->filter(fn($base) => in_array("{$base}_id", $columns))
            ->values()
            ->all();

    }

    public function hasFeature ( string|array $feature = null, array $parents = null ) {
        
        $features = (array) $feature;
        foreach ( $features as $feat ) { if ( !$this->has($feat) ) return false; }

        foreach ( $parents ?? [] as $rel ) {

            try{
                
                if ( !($related = data_get($this, $rel)) || is_string($related) ) continue;

                foreach ( $features as $feat ) { if ( !$related->has($feat) ) return false; }

            } catch ( \Exception $e ) {}

        }

        return true;

    }
    public function hasFeatureOrFail ( string|array $feature = null, array $parents = null ) {

        return $this->hasFeature($feature, $parents) ?: $this->failPermissionNow();

    }
    public function isBelongsToChain ( array $chain = [], bool $allowNull = true ) {

        return collect($chain)->every(fn($value, $key) => (!$this->$key && $allowNull) || ($this->$key === $value));

    }
    public function isOneRelation ( string $relation ) {

        try {

            $rel = $this->$relation();

            return $rel instanceof \Illuminate\Database\Eloquent\Relations\HasOne
                || $rel instanceof \Illuminate\Database\Eloquent\Relations\MorphOne
                || $rel instanceof \Illuminate\Database\Eloquent\Relations\BelongsTo
                || $rel instanceof \Illuminate\Database\Eloquent\Relations\HasOneThrough;

        } catch ( \Exception $e ) { return false; }
            
    }
    
    public function cacheTag ( string $name = null, array $params = [] ) {

        return array_filter([
            'model:' . ($name ?? $this->getModelName()),
            ...array_map(fn($v) => is_scalar($v) ? $v : json_encode($v), $params)
        ]);

    }
    public function cacheKey ( string|array $key = null ) {

        return md5(serialize(Arr::sortRecursive((array) $key)));

    }
    public function deleteCacheTag ( string $name = null, array $params = [] ) {

        return delete_cache($this->cacheTag($name, $params));

    }
    public function remember ( string $tag = null, string|array $key = null, int $minutes = null, callable $callback = null ) {

        return remember($this->cacheTag($tag), $this->cacheKey($key), $minutes, $callback);

    }
    public function successRemember ( string $tag = null, string|array $key = null, int $minutes = null, callable $callback = null ) {

        return success($this->remember($tag, $key, $minutes, $callback));

    }
    public function successDownload ( string $tag = null, string|array $key = null, int $minutes = null, callable $callback = null, string $name = null, string $type = null, string $ext = null ) {

        return successDownload(
            $this->remember($tag, $key, $minutes, $callback),
            $name ?? $this->getModelName(),
            $type ?? 'text/csv',
            $ext ?? 'csv'
        );

    }

}
