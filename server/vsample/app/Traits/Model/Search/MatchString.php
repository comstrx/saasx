<?php

namespace App\Traits\Model\Search;
use Illuminate\Database\Eloquent\Builder;

trait MatchString {

    use Helpers;

    protected function matchString ( Builder $query, string $column, string $operator = null, mixed $value = null, string $type = null ) {

        $operator = $operator === 'like' && str_contains($type, 'int') ? null : $operator;
        $value = in_array($type, ['tinyint(1)', 'boolean']) ? bool($value) : string($value);

        return match ( true ) {
            $operator === 'like' || $type === 'json' =>
                $query->where(fn($q) =>
                    collect(preg_split('/[\s\-_,.]+/', strtolower(string($value))))
                        ->unique()
                        ->filter(fn($token) => strlen($token) > 3 || ( strlen($token) > 1 && strlen(string($value)) < 4 ))
                        ->each(fn($token) => $q->orWhereRaw("LOWER({$column}) LIKE ?", ["%{$token}%"]))
                ),
            default =>
                $operator ?
                    $query->where($column, $operator, $value) :
                    $query->where($column, $value),
        };

    }

}
