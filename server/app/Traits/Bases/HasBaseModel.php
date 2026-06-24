<?php

declare(strict_types=1);

namespace App\Traits\Bases;
use App\Support\Cast;
use App\Support\Database;
use App\Support\Log;
use App\Support\Num;
use App\Support\Parse;
use App\Support\Str;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \Illuminate\Database\Eloquent\Model */
trait HasBaseModel {

    /** @var array<string, bool> */
    protected static array $columnExists = [];

    protected ?string $keysetCursor = null;
    protected ?int $keysetLimit = null;
    /** @var array{column: string, direction: string} */
    protected array $keysetSort = ['column' => 'created_at', 'direction' => 'desc'];
    /** @var list<string> */
    protected array $searchPermissions = [];

    /**
     * @param  Builder<static> $query
     * @return Builder<static>
     */
    public function scopeSearch ( Builder $query, ?string $text = null, array $filter = [], array $field = [], ?string $sortBy = null, ?int $page = null, ?int $limit = null, array $scope = [], array $permission = [], array $callback = [] ): Builder {

        $this->keysetLimit = (int) Num::clamp($limit ?? 20, 1, 100);
        $this->searchPermissions = $this->stringList($permission);

        $query = $this->applyText($query, $text, $field);
        $query = $this->applyFilters($query, $filter);
        $query = $this->scopeWhereScope($query, $scope);
        $query = $this->applyCallbacks($query, $callback);

        return $this->applySort($query, $sortBy);

    }
    /**
     * @param  Builder<static> $query
     * @return Builder<static>
     */
    public function scopeWhereScope ( Builder $query, array $scope ): Builder {

        foreach ( $scope as $key => $value ) {

            $column = (string) $key;

            if ( ! $this->hasColumn($column) ) {

                Log::warning('search.scope.column', ['column' => $column]);

                continue;

            }

            $qualified = $this->getTable() . '.' . $column;

            is_array($value) ? $query->whereIn($qualified, Cast::values($value)) : $query->where($qualified, $value);

        }

        return $query;

    }
    /**
     * @param  Builder<static> $query
     * @return Builder<static>
     */
    public function scopeWithCursor ( Builder $query, ?string $cursor ): Builder {

        $this->keysetCursor = Cast::string($cursor);

        return $query;

    }
    /**
     * @param  Builder<static> $query
     * @param  class-string<JsonResource> $resource
     * @return array<string, mixed>
     */
    public function getResource ( Builder $query, string $resource, bool $one = false ): array {

        if ( $one ) return ['item' => $resource::make($this->withRelations($query)->firstOrFail())];

        $limit = $this->keysetLimit ?? 20;
        $items = $this->withRelations($this->applyCursor($query))->limit($limit + 1)->get();

        $hasMore = $items->count() > $limit;
        $items = $items->slice(0, $limit)->values();

        return [
            'items' => $resource::collection($items),
            'meta'  => ['limit' => $limit, 'count' => $items->count(), 'has_more' => $hasMore, 'cursor' => $hasMore ? $this->encodeCursor($items->last()) : null],
        ];

    }
    /**
     * @param  Builder<static> $query
     * @param  array<string, mixed> $opts
     * @return array<string, mixed>
     */
    public function getStats ( Builder $query, array $opts = [] ): array {

        $stats = ['count' => (clone $query)->count()];

        foreach ( ['sum', 'avg'] as $aggregate ) {

            foreach ( Cast::values($opts[$aggregate] ?? []) as $raw ) {

                $column = Cast::string($raw);

                if ( $column === null || ! $this->hasColumn($column) ) {

                    Log::warning('search.stats.column', ['aggregate' => $aggregate, 'column' => $raw]);

                    continue;

                }

                $qualified = $this->getTable() . '.' . $column;
                $stats[$aggregate][$column] = $aggregate === 'sum' ? (clone $query)->sum($qualified) : (clone $query)->avg($qualified);

            }

        }

        return $stats;

    }
    /**
     * @param  Builder<static> $query
     * @return \Illuminate\Support\Collection<int, static>
     */
    public function getItems ( Builder $query, array $opts = [] ): \Illuminate\Support\Collection {

        return $this->withRelations($query)->get()->toBase();

    }
    public function hasColumn ( string $column ): bool {

        $key = $this->getTable() . '.' . $column;

        return self::$columnExists[$key] ??= Database::hasColumn($this->getTable(), $column);

    }
    /**
     * @param  Builder<static> $query
     * @return Builder<static>
     */
    protected function applyText ( Builder $query, ?string $text, array $field ): Builder {

        $text = Cast::string($text);

        if ( $text === null ) return $query;

        $columns = $field === [] ? $this->getFillable() : $field;
        $term = '%' . Database::escapeLike($text) . '%';

        return $query->where(function ( Builder $group ) use ( $columns, $term, $text ): void {

            if ( Database::isUuid($text) ) $group->orWhere($this->getTable() . '.id', $text);

            foreach ( $columns as $raw ) {

                $column = Cast::string($raw);

                if ( $column === null || ! $this->hasColumn($column) ) continue;

                $group->orWhere($this->getTable() . '.' . $column, 'like', $term);

            }

        });

    }
    /**
     * @param  Builder<static> $query
     * @return Builder<static>
     */
    protected function applyFilters ( Builder $query, array $filter ): Builder {

        foreach ( $filter as $key => $value ) {

            $field = (string) $key;
            $hasOperator = Str::contains($field, '@');
            $column = $hasOperator ? Str::before($field, '@') : $field;
            $operator = $hasOperator ? Str::lower(Str::after($field, '@')) : '=';

            if ( ! $this->hasColumn($column) ) {

                Log::warning('search.filter.column', ['column' => $column]);

                continue;

            }

            $this->applyOperator($query, $this->getTable() . '.' . $column, $operator, $value);

        }

        return $query;

    }
    /** @param Builder<static> $query */
    protected function applyOperator ( Builder $query, string $column, string $operator, mixed $value ): void {

        if ( $operator === 'null' || $operator === 'notnull' ) {

            $operator === 'null' ? $query->whereNull($column) : $query->whereNotNull($column);

            return;

        }

        if ( $operator === 'in' || $operator === 'notin' ) {

            $items = $this->items($value);
            $operator === 'in' ? $query->whereIn($column, $items) : $query->whereNotIn($column, $items);

            return;

        }

        if ( $operator === 'between' || $operator === 'notbetween' ) {

            $this->applyBetween($query, $column, $value, $operator === 'notbetween');

            return;

        }

        if ( $operator === 'like' ) {

            $term = Cast::string($value);

            if ( $term !== null ) $query->where($column, 'like', '%' . Database::escapeLike($term) . '%');

            return;

        }

        $comparison = match ( $operator ) {
            '=', '!=', '<>', '<', '<=', '>', '>=' => true,
            default                               => false,
        };

        if ( ! $comparison ) {

            Log::warning('search.filter.operator', ['operator' => $operator, 'column' => $column]);

            return;

        }

        $scalar = Cast::string($value);

        if ( $scalar === null ) {

            Log::warning('search.filter.value', ['column' => $column]);

            return;

        }

        $query->where($column, $operator === '<>' ? '!=' : $operator, $scalar);

    }
    /** @param Builder<static> $query */
    protected function applyBetween ( Builder $query, string $column, mixed $value, bool $not ): void {

        $items = $this->items($value);
        $from = $items[0] ?? null;
        $to = $items[1] ?? null;

        if ( $from === null || $to === null ) {

            Log::warning('search.filter.between', ['column' => $column]);

            return;

        }

        $not ? $query->whereNotBetween($column, [$from, $to]) : $query->whereBetween($column, [$from, $to]);

    }
    /**
     * @param  Builder<static> $query
     * @return Builder<static>
     */
    protected function applyCallbacks ( Builder $query, array $callback ): Builder {

        foreach ( $callback as $item ) {

            if ( ! is_callable($item) ) {

                Log::warning('search.callback.invalid', []);

                continue;

            }

            $result = $item($query);

            if ( $result instanceof Builder ) $query = $result;

        }

        return $query;

    }
    /**
     * @param  Builder<static> $query
     * @return Builder<static>
     */
    protected function applySort ( Builder $query, ?string $sortBy ): Builder {

        $spec = match ( Str::lower(Cast::string($sortBy) ?? 'newest') ) {
            'newest' => 'created_at@desc',
            'oldest' => 'created_at@asc',
            default  => Cast::string($sortBy) ?? 'created_at@desc',
        };

        $resolved = Database::sort($spec, Database::columns($this->getTable())) ?? ['column' => 'created_at', 'direction' => 'desc'];

        if ( ! $this->hasColumn($resolved['column']) ) $resolved['column'] = $this->hasColumn('created_at') ? 'created_at' : 'id';

        $this->keysetSort = $resolved;
        $table = $this->getTable();
        $direction = $resolved['direction'] === 'desc' ? 'desc' : 'asc';

        $query->orderBy($table . '.' . $resolved['column'], $direction);

        if ( $resolved['column'] !== 'id' ) $query->orderBy($table . '.id', $direction);

        return $query;

    }
    /**
     * @param  Builder<static> $query
     * @return Builder<static>
     */
    protected function applyCursor ( Builder $query ): Builder {

        if ( $this->keysetCursor === null ) return $query;

        $cursor = Database::decodeCursor($this->keysetCursor);
        $column = $this->keysetSort['column'];
        $value = $cursor[$column] ?? null;
        $id = $cursor['id'] ?? null;

        if ( $value === null || $id === null ) return $query;

        $table = $this->getTable();
        $operator = $this->keysetSort['direction'] === 'desc' ? '<' : '>';

        if ( $column === 'id' ) return $query->where($table . '.id', $operator, $id);

        return $query->where(function ( Builder $group ) use ( $table, $column, $operator, $value, $id ): void {

            $group->where($table . '.' . $column, $operator, $value)->orWhere(function ( Builder $tie ) use ( $table, $column, $value, $operator, $id ): void {

                $tie->where($table . '.' . $column, '=', $value)->where($table . '.id', $operator, $id);

            });

        });

    }
    protected function encodeCursor ( ?Model $item ): ?string {

        if ( $item === null ) return null;

        $column = $this->keysetSort['column'];

        return Database::encodeCursor([$column => $item->getRawOriginal($column), 'id' => $item->getRawOriginal('id')]);

    }
    /**
     * @param  Builder<static> $query
     * @return Builder<static>
     */
    protected function withRelations ( Builder $query ): Builder {

        if ( ! method_exists($this, 'getWithRelations') ) return $query;

        $result = $this->getWithRelations($query);

        return $result instanceof Builder ? $result : $query;

    }
    /** @return list<mixed> */
    protected function items ( mixed $value ): array {

        return is_string($value) ? Parse::items($value) : Cast::values($value);

    }
    /** @return list<string> */
    protected function stringList ( array $values ): array {

        $result = [];

        foreach ( $values as $value ) {

            $string = Cast::string($value);

            if ( $string !== null ) $result[] = $string;

        }

        return $result;

    }

}
