<?php

namespace App\Traits\Bases;
use Illuminate\Database\Eloquent\Model;

trait HasBaseRepository {

    public function modelBoot ( Model $model = null, array $data = [], string $event = 'create' ) {

        if ( $event === 'create' && method_exists($this, 'createBoot') ) return $this->createBoot($data);
        if ( $event === 'update' && method_exists($this, 'updateBoot') ) return $this->updateBoot($model, $data);
        if ( $event === 'delete' && method_exists($this, 'deleteBoot') ) return $this->deleteBoot($model, $data);
        if ( in_array($event, ['create', 'update']) && method_exists($this, 'boot') ) return $this->boot($model, $data, $event);

        return $data;

    }
    public function modelBooted ( Model $model, array $data = [], string $event = 'created', bool $logs = true ) {

        if ( $logs ) $model->modelBooted($event);

        if ( $event === 'created' && method_exists($this, 'createdBoot') ) return $this->createdBoot($model, $data);
        if ( $event === 'updated' && method_exists($this, 'updatedBoot') ) return $this->updatedBoot($model, $data);
        if ( $event === 'deleted' && method_exists($this, 'deletedBoot') ) return $this->deletedBoot($model, $data);
        if ( in_array($event, ['created', 'updated']) && method_exists($this, 'booted') ) return $this->booted($model, $data, $event);

    }
    public function fields ( array $data = [] ) {

        return $data;

    }
    public function factory ( array $data = [] ) {

        $modelClass = $this->model;
        return $modelClass::factory()->state($data);

    }
    public function getModel () {

        return $this->model;

    }
    public function throwError () {

        return $this->model->failNow();

    }
    public function query () {

        return $this->model->query();
        
    }
    public function active () {

        return $this->query()->active();
        
    }
    public function with ( array|string $relations = null ) {

        return $this->model->with($relations ?? $this->model->getWithRelations());

    }
    public function count ( string|array $scope = null ) {

        return $this->with()->whereScope($scope)->count();

    }
    public function get ( string|array $scope = null ) {

        return $this->with()->whereScope($scope)->get();

    }
    public function all ( string|array $scope = null ) {

        return $this->get($scope);

    }
    public function paginate ( int $page = 1, int $limit = 10, string|array $scope = null ) {

        return $this->with()->whereScope($scope)->forPage($page, $limit)->get();

    }
    public function exists ( int $id, string|array $scope = null ) {

        return $this->model->where('id', $id)->whereScope($scope)->exists();

    }
    public function find ( int $id, string|array $scope = null ) {

        return $this->model->where('id', $id)->whereScope($scope)->first();

    }
    public function findOrFail ( int $id, string|array $scope = null ) {

        return $this->model->where('id', $id)->whereScope($scope)->firstOrFail();

    }
    public function findBy ( string $column, mixed $value = null, string|array $scope = null ) {

        return $this->model->where($column, $value)->whereScope($scope)->first();

    }
    public function findByOrFail ( string $column, mixed $value = null, string|array $scope = null ) {

        return $this->model->where($column, $value)->whereScope($scope)->firstOrFail();

    }
    public function firstWhere ( string $column, mixed $value, string|array $scope = null ) {
        
        return $this->model->where($column, $value)->whereScope($scope)->first();

    }
    public function create ( array $data = [], string|array $scope = null, bool $boot = true, bool $strict = true ) {

        $data = array_merge($data, (array) $scope);

        if ( $strict && !empty($this->fields()) ) $fixedData = $this->fields($data);
        else $fixedData = array_intersect_key($data, array_flip($this->model->getFillable()));

        $record = $this->model->create( $this->modelBoot(null, $fixedData, 'create') )->fresh();

        $this->modelBooted($record, $data, 'created', $boot);
        return $record;

    }
    public function update ( int $id, array $data = [], string|array $scope = null, bool $boot = true, bool $strict = true ) {

        $record = $this->findOrFail($id, $scope);
        
        if ( $strict && !empty($this->fields()) ) $fixedData = array_intersect_key($this->fields($data), $data);
        else $fixedData = array_intersect_key($data, array_flip($this->model->getFillable()));
        
        $record->update( $this->modelBoot($record, $fixedData, 'update') );

        $this->modelBooted($record, $data, 'updated', $boot);
        return $record;

    }
    public function updateMany ( array $items = [], string|array $scope = null, bool $boot = true, bool $strict = true ) {

        return collect($items)->map(fn($item) => $this->update($item['id'], $item, $scope, $boot, $strict));

    }
    public function insert ( array $data = [], string|array $scope = null, bool $boot = true ) {

        return collect($data)->map(fn($item) => $this->create($item, $scope, $boot));

    }
    public function firstOrCreate ( array $condition = [], array $data = [], string|array $scope = null, bool $boot = true, bool $strict = true ) {

        return $this->model->where($condition)->whereScope($scope)->first() ??
            $this->create(array_merge($condition, $data), $scope, $boot, $strict);

    }
    public function updateOrCreate ( array $condition = [], array $data = [], string|array $scope = null, bool $boot = true, bool $strict = true ) {

        $record = $this->model->where($condition)->whereScope($scope)->first();

        return $record ?
            $this->update($record->id, array_merge($condition, $data), $scope, $boot, $strict) :
            $this->create(array_merge($condition, $data), $scope, $boot, $strict);

    }
    public function delete ( int|array $id = [], string|array $scope = null, bool $boot = true ) {

        return collect((array) $id)
            ->filter(function ($id) use ( $scope, $boot ) {
                $record = $this->find($id, $scope);
                if ( !$record ) return;

                $this->modelBoot($record, (array) $id, 'delete');
                $this->modelBooted($record, (array) $id, 'deleted', $boot);
                return $record->delete();
            })
            ->count();

    }
    public function forceDelete ( int|array $id = [], string|array $scope = null, bool $boot = true ) {

        return collect((array) $id)
            ->filter(function ($id) use ( $scope, $boot ) {
                $record = $this->find($id, $scope);
                if ( !$record ) return;
                
                $this->modelBoot($record, (array) $id, 'delete');
                $this->modelBooted($record, (array) $id, 'deleted', $boot);
                return $record->forceDelete();
            })
            ->count();
    
    }
    public function setDeleted ( int|array $id = [], string|array $scope = null, bool $boot = true ) {

        return !$this->model->hasColumn('deleted') ? 0 :
            collect((array) $id)
            ->filter(function($id) use ( $scope, $boot ) {
                $record = $this->find($id, $scope);
                if ( !$record ) return;

                $record->update(['deleted' => true]);
                $this->modelBooted($record, (array) $id, 'deleted', $boot);
                return $record;
            })
            ->count();

    }
    public function dbTransaction ( callable $callback, bool $response = true ) {
        
        return $this->model->dbTransaction($callback, $response);

    }

}
