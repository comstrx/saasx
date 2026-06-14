<?php

namespace App\Traits\Model\Search;
use Illuminate\Database\Eloquent\Builder;

trait MatchColumn {

    use Helpers, MatchDate, MatchString;

    protected function matchNull ( Builder $query, string $column, string $operator = null, mixed $value = null ) {
      
        return match ( str_replace([' ', '_', '-'], '', strtolower(string($value) ?? '')) ) {
            'null', '' => $query->whereNull($column),
            'notnull'  => $query->whereNotNull($column),
            default => null,
        };

    }
    protected function matchColumn ( Builder $query, string $column, string $operator = null, mixed $value = null ) {

        $type = $query->getModel()->getColumnType($column);
        if ( !$type ) return $query;

        $column   = $query->getModel()->resolveColumn($column);
        $operator = strtolower(str_replace(' ', '', $operator ?? ''));
        
        $nullMatched = $this->matchNull($query, $column, $operator, $value);
        if ( $nullMatched ) return $nullMatched;

        if ( $this->isDateColumn($type) ) return $this->matchDate($query, $column, $operator, $value);
        else return $this->matchString($query, $column, $operator, $value, $type);

    }
    protected function matcher ( Builder $query, string $column, string $operator = null, mixed $value = null ) {

        try {

            if ( !str_contains($column, '.') ) return $this->matchColumn($query, $column, $operator, $value);

            $segments  = explode('.', $column);
            $relation  = array_shift($segments);
            $relColumn = implode('.', $segments);

            return $query->whereHas($relation, fn($q) => $this->matcher($q, $relColumn, $operator, $value));

        } catch ( \Exception $e ) { report($e); return $query; }

    }

}
