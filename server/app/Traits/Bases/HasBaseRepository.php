<?php

declare(strict_types=1);

namespace App\Traits\Bases;
use App\Models\BaseModel;
use App\Support\Arr;
use App\Support\Cast;
use App\Support\Database;
use App\Support\Num;
use App\Support\Parse;
use App\Support\Str;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Http\Resources\Json\JsonResource;

trait HasBaseRepository {

    /**
     * @param  array<string, mixed> $data
     * @return array<string, mixed>
     */
    public function fields ( array $data = [] ): array {

        return [];

    }
    /**
     * @param  array<string, mixed> $params
     * @param  array<string, mixed> $scopes
     * @param  list<string> $permissions
     * @param  list<callable> $callbacks
     */
    public function index ( array $params = [], array $scopes = [], array $permissions = [], array $callbacks = [] ): mixed {

        $query = $this->read($params, $scopes, $permissions, $callbacks);

        return $query->getModel()->getResource($query, $this->resource());

    }
    /**
     * @param  array<string, mixed> $scopes
     * @param  list<string> $permissions
     */
    public function show ( string $id, array $scopes = [], array $permissions = [] ): mixed {

        $query = $this->read(['ids' => $id], $scopes, $permissions, []);

        return $query->getModel()->getResource($query, $this->resource(), true);

    }
    /**
     * @param  array<string, mixed> $params
     * @param  array<string, mixed> $scopes
     * @param  list<string> $permissions
     * @return array<string, mixed>
     */
    public function statistics ( array $params = [], array $scopes = [], array $permissions = [] ): array {

        $query = $this->read($params, $scopes, $permissions, []);

        return $query->getModel()->getStats($query, Cast::array($params['stats'] ?? []));

    }
    /** @param array<string, mixed> $data */
    public function store ( array $data ): Model {

        return Database::transaction(function () use ( $data ): Model {

            $model = $this->model->newInstance();
            $model->forceFill($this->fields($data))->save();

            $this->dispatchBoot($model, $data, 'create');

            return $model->refresh();

        });

    }
    /** @param array<string, mixed> $data */
    public function update ( string $id, array $data ): Model {

        return Database::transaction(function () use ( $id, $data ): Model {

            $model = $this->query()->whereKey($id)->firstOrFail();
            $model->forceFill($this->writable($data))->save();

            $this->dispatchBoot($model, $data, 'update');

            return $model->refresh();

        });

    }
    public function delete ( string $id ): bool {

        return Database::transaction(function () use ( $id ): bool {

            $model = $this->query()->whereKey($id)->firstOrFail();
            $deleted = (bool) $model->delete();

            $this->dispatchBoot($model, [], 'delete');

            return $deleted;

        });

    }
    /** @param list<string> $ids */
    public function deleteMany ( array $ids ): int {

        return Database::transaction(function () use ( $ids ): int {

            $models = $this->query()->whereKey($ids)->get();

            foreach ( $models as $model ) {

                $model->delete();
                $this->dispatchBoot($model, [], 'delete');

            }

            return $models->count();

        });

    }
    /**
     * @param  array<string, mixed> $scopes
     * @return Builder<BaseModel>
     */
    public function query ( array $scopes = [] ): Builder {

        return $this->model->newQuery()->whereScope($scopes);

    }
    /**
     * @param  array<string, mixed> $params
     * @param  array<string, mixed> $scopes
     * @param  list<string> $permissions
     * @param  list<callable> $callbacks
     * @return Builder<BaseModel>
     */
    protected function read ( array $params, array $scopes, array $permissions, array $callbacks ): Builder {

        $query = $this->model->newQuery();

        $this->applyIds($query, $params['ids'] ?? null);

        if ( method_exists($this->model, 'setIncludes') ) $this->model->setIncludes(Cast::array($params['includes'] ?? $params['include'] ?? []));

        return $query->search(
            Cast::string($params['search'] ?? null),
            Cast::array($params['filters'] ?? []),
            Cast::array($params['fields'] ?? []),
            Cast::string($params['sort'] ?? null),
            Cast::integer($params['page'] ?? null),
            Cast::integer($params['limit'] ?? null),
            $scopes,
            $permissions,
            $callbacks,
        )->withCursor(Cast::string($params['cursor'] ?? null));

    }
    /** @param Builder<BaseModel> $query */
    protected function applyIds ( Builder $query, mixed $ids ): void {

        if ( $ids === null ) return;

        $list = is_array($ids) ? Cast::values($ids) : Parse::items((string) $ids);

        if ( $list !== [] ) $query->whereKey($list);

    }
    /**
     * @param  array<string, mixed> $data
     * @return array<string, mixed>
     */
    protected function writable ( array $data ): array {

        $result = [];

        foreach ( $this->fields($data) as $key => $value ) {

            if ( Arr::has($data, (string) $key) ) $result[$key] = $value;

        }

        return $result;

    }
    /**
     * @param  array<string, mixed> $params
     * @param  array<string, mixed> $scopes
     * @param  list<string> $permissions
     */
    public function related ( string $id, string $relation, array $params = [], array $scopes = [], array $permissions = [], bool $one = false, ?string $relatedId = null ): mixed {

        $parent = $this->query($scopes)->whereKey($id)->first();

        if ( ! $parent instanceof BaseModel || ! method_exists($parent, 'resolveRelation') ) return null;

        $resolved = $parent->resolveRelation($relation);

        if ( ! $resolved instanceof Relation ) return null;

        $related = $resolved->getRelated();

        if ( ! $related instanceof BaseModel ) return null;

        $resource = $this->resourceFor($related::class);
        $query = $resolved->getQuery();

        if ( $one || $relatedId !== null ) {

            if ( $relatedId !== null ) $query->whereKey($relatedId);

            $item = $query->first();

            return $item === null ? null : ['item' => $resource::make($item)];

        }

        $limit = $this->relatedLimit($params);
        $items = $query->limit($limit)->get();

        return ['items' => $resource::collection($items), 'meta' => ['count' => $items->count(), 'limit' => $limit]];

    }
    /** @return class-string<JsonResource> */
    protected function resource (): string {

        return $this->resourceFor($this->model::class);

    }
    /**
     * @param  class-string $model
     * @return class-string<JsonResource>
     */
    protected function resourceFor ( string $model ): string {

        $class = 'App\\Http\\Resources\\' . Str::afterLast($model, '\\') . 'Resource';

        if ( ! is_subclass_of($class, JsonResource::class) ) throw new \RuntimeException('Resource not found: ' . $class);

        return $class;

    }
    /** @param array<string, mixed> $params */
    protected function relatedLimit ( array $params ): int {

        return (int) Num::clamp(Cast::integer($params['limit'] ?? null) ?? 50, 1, 100);

    }
    /** @param array<string, mixed> $data */
    protected function dispatchBoot ( Model $model, array $data, string $event ): void {

        if ( $event === 'create' && method_exists($this, 'createBoot') ) $this->createBoot($model, $data);
        if ( $event === 'update' && method_exists($this, 'updatedBoot') ) $this->updatedBoot($model, $data);
        if ( $event === 'delete' && method_exists($this, 'deletedBoot') ) $this->deletedBoot($model, $data);

        if ( method_exists($this, 'booted') ) $this->booted($model, $data, $event);

    }

}
