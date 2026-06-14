<?php

namespace App\Traits\Model\Search;
use Illuminate\Database\Eloquent\Builder;

trait Applies {

    use Helpers, MatchColumn;
    
    protected function filterIn ( Builder $query, string $column, array $value = [], bool $not = false ) {

        return $query->where(function( $outer ) use ( $column, $value, $not ) {

            foreach ( $value as $val ) {
                
                $hasOperator = preg_match('/^(<=|>=|<>|!=|=|<|>|in|notin|like)\s*(.+)$/i', trim($val), $m);
                
                if ( $hasOperator ) [$operator, $val] = [strtolower($m[1]), trim($m[2])];
                else [$operator, $val] = preg_split('/[@:]/', string($val ?? ''), 2) + ['', ''];

                if ( !$not ) $outer->orWhere(fn($q) => $this->SearchFilter($q, ["{$column}@{$operator}" => $val]));
                else $outer->where(fn($q) => $this->SearchFilter($q, ["{$column}@{$operator}" => $val]), null, null, 'and not');

            }

        });

    }
    protected function filterArray ( Builder $query, string $column, string $operator, mixed $value = null ) {

        $operator = str_replace(' ', '', strtolower(trim($operator)));
       
        if ( in_array($operator, ['in', 'notin', 'between', 'notbetween']) ) $value = parse($value);
        if ( !is_array($value) ) return null;

        return match ( $operator ) {
            'between'    => $query->whereBetween($column, $value),
            'notbetween' => $query->whereNotBetween($column, $value),
            'notin'      => $this->filterIn($query, $column, $value, true),
            default      => $this->filterIn($query, $column, $value),
        };

    }
    protected function SearchFilter ( Builder $query, string|array $filter = null ) {

        foreach ( (array) $filter as $key => $value ) {

            try {

                [$column, $operator] = preg_split('/[@:]/', string($key ?? ''), 2) + ['', ''];
               
                $query =
                    $this->filterArray($query, $column, $operator, $value) ??
                    $this->matcher($query, $column, $operator, $value);
               
            } catch ( \Exception $e ) {}

        }

        return $query;

    }
    protected function searchScope ( Builder $query, string|array $scope = null ) {

        collect((array) $scope)
            ->mapWithKeys(fn($value, $key) => is_string($key) ? [$key => $value ?? true] : [$value => true])
            ->filter(fn($value, $key) => $query->getModel()->hasColumn($key))
            ->each(fn($value, $key) =>
                is_array($value) ?
                    in_array($value[0] ?? null, ['<', '>', '<=', '>=', '!=', '=']) && isset($value[1]) ?
                        $query->where("{$query->getModel()->getTable()}.{$key}", $value[0], $value[1]) :
                        $query->whereIn("{$query->getModel()->getTable()}.{$key}", $value)
                    : $query->where("{$query->getModel()->getTable()}.{$key}", $value)
            );

        return $query;

    }
    protected function searchText ( Builder $query, mixed $value = null, array $columns = [] ) {

        if ( !trim(string($value) ?? '') ) return $query;
        
        try {

            $numeric = str_replace('=', '', string($value) ?? '');
         
            if ( is_numeric($numeric) ) return $query->where('id', $numeric);
            if ( empty($columns) ) return $query;

            return $query->where(fn($query) =>
                collect($columns)->each(fn($column) =>
                    $query->orWhere(fn($q) => $this->matcher($q, $column, 'like', $value))
                )
            );

        } catch ( \Exception $e ) {}
        
        return $query;

    }
    protected function searchCallback ( Builder $query, callable|string|array $callback = [], array $params = [] ) {

        try { if ( is_callable($callback) ) return $callback($query, $params); } catch ( \Exception $e ) {}

        foreach ( (array) $callback as $callback ) {

            try {

                if ( is_callable($callback) ) {

                    $query = $callback($query, $params);

                }
                elseif ( is_string($callback) ) {

                    if ( str_contains($callback, '@') ) {

                        [$class, $method] = explode('@', $callback);

                        if ( class_exists($class) && method_exists($class, $method) ) {

                            $query = app($class)->{$method}($query, $params);

                        }

                    }
                    elseif ( method_exists($query->getModel(), $callback) ) {

                        $query = $query->getModel()->{$callback}($query, $params);

                    }
                    else {

                        $query = $query->{$callback}($params);

                    }

                }
                elseif ( is_array($callback) ) {

                    $class  = $callback['class'] ?? array_keys($callback)[0] ?? null;
                    $method = $callback['name'] ?? array_values($callback)[0] ?? null;

                    if ( $method && $class && class_exists($class) && method_exists($class, $method) ) {

                        $query = app()->make($class)->{$method}($query, $params);

                    }

                }
    
            } catch ( \Exception $e ) {}

        }

        return $query;

    }
    protected function searchAggregates ( Builder $query, array $aggregates = null ) {
       
        foreach ( $aggregates as $aggregate ) {

            $aggregate = (array) $aggregate;

            [$relation, $method, $column, $as] = $aggregate + [null, 'count', '*', null];
            if ( $method === 'count' && count($aggregate) === 3 ) [$column, $as] = ['id', $column];

            $query->withAggregate($as ? ["{$relation} as {$as}"] : $relation, $column, $method);

        }

        return $query;

    }
    protected function searchDate ( Builder $query, string $column, string $operator = null, mixed $value = null ) {

        return $this->matchDate($query, $column, $operator, $value);

    }
    protected function searchId ( Builder $query, int|string|array $id = null ) {

        $ids = is_string($id) ? explode(',', $id) : (array) $id;
        $ids = collect($ids)->filter(fn($id) => is_numeric($id))->unique()->values()->all();

        return empty($ids) ? $query : $query->whereIn('id', [...$ids]);

    }
    protected function searchSort ( Builder $query, string $column = null, string $direction = null ) {

        try {

            [$column, $direction] = preg_split('/[@:]/', string($column ?? ''), 2) + ['id', $direction];
            $direction = $column === 'oldest' ? 'asc' : ($column === 'newest' ? 'desc' : $direction);

            if ( !$query->getModel()->hasColumn($column) ) [$column, $direction] = ['id', $direction];
            $direction = in_array($direction, ['asc', 'desc']) ? $direction : 'desc';
            
            return $query->orderBy("{$query->getModel()->getTable()}.{$column}", $direction);
            
        } catch ( \Exception $e ) {}

        return $query;

    }

}
