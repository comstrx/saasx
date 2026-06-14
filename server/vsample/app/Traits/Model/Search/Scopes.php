<?php

namespace App\Traits\Model\Search;
use Illuminate\Database\Eloquent\Builder;

trait Scopes {

    use Helpers, Applies;

    public function scopeWhereText ( Builder $query, mixed $value = null ) {

        $columns = $query->getModel()->getSearchable() ?: $query->getModel()->getFillable();
        return $this->searchText($query, $this->getMeta('search', string($value)), $columns);

    }
    public function scopeWhereFilter ( Builder $query, string|array $filters = null ) {
        
        return $this->searchFilter($query, $this->getMeta('filters', (array) $filters));

    }
    public function scopeWhereCallback ( Builder $query, callable|string|array $callback = null, array $params = [] ) {

        if ( !is_callable($callback) ) $callback = ((array) $callback) ?: $query->getModel()->getCallbackSearchable();
        return $this->searchCallback($query, $callback, $params);

    }
    public function scopeWithRelation ( Builder $query, string|array $relation = null ) {

        $relations = ((array) $relation) ?: $query->getModel()->getWithRelations();
        return empty($relations) ? $query : $query->with($relations);

    }
    public function scopeWithAggregates ( Builder $query, array $aggregates = null ) {
       
        return $this->searchAggregates($query, ((array) $aggregates) ?: $query->getModel()->getWithAggregates());

    }
    public function scopeWhereMatchDate ( Builder $query, string $column, string $operator = null, mixed $value = null ) {

        return $this->searchDate($query, $column, $operator, $value);

    }
    public function scopeWhereId ( Builder $query, int|string|array $id = null ) {

        return $this->searchId($query, $id);

    }
    public function scopeWhereScope ( Builder $query, string|array $scope = null ) {

        return $this->searchScope($query, (array) $scope);

    }
    public function scopeWherePermission ( Builder $query, string|array $permission = null ) {

        $this->setPermissions($permission);
        return $query;

    }
    public function scopeWithDeleted ( Builder $query, bool $only = false ) {

        return $only ? $query->onlyTrashed() : $query->withTrashed();

    }
    public function scopeGroupByColumn ( Builder $query, string|array $columns ) {

        return $query->groupBy((array) $columns);

    }
    public function scopeSelectOnly ( Builder $query, string|array $columns = null ) {

        return empty((array) $columns) ? $query : $query->select((array) $columns);

    }
    public function scopeSortBy ( Builder $query, string $column = null, string $direction = null ) {

        return $this->searchSort($query, $this->getMeta('sort', $column), $direction);

    }
    public function scopePagination ( Builder $query, int $page = null, int $limit = null ) {

        $page = max(1, integer($this->getMeta('page', isset($page) ? $page : null)));
        $limit = max(1, integer($this->getMeta('limit', isset($limit) ? $limit : null)));
      
        $this->setMeta(['page' => $page, 'limit' => $limit, 'total' => (clone $query)->count()]);
        return $query->forPage($page, $limit);

    }
    public function scopeSearch (
        Builder $query,

        string $text = null,
        int|array $id = null,

        string|array $withRelation = null,
        string|array $filter = null,
        string|array $scope = null,
        string|array $permission = null,
        callable|string|array $callback = null,
        string|array $field = null,
        array $aggregates = null,

        string $sortBy = null,
        int $page = 1,
        int $limit = 10 ) {

        return $query
            ->whereText($text)
            ->withRelation($withRelation)
            ->whereId($id)
            ->whereFilter($filter)
            ->whereScope($scope)
            ->wherePermission($permission)
            ->withAggregates($aggregates)
            ->whereCallback($callback, array_merge((array) $filter, (array) $scope))
            ->selectOnly($field)
            ->sortBy($sortBy)
            ->pagination($page, $limit);

    }

}
