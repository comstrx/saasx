<?php

declare(strict_types=1);

namespace App\Traits\Bases;
use App\Support\Arr;
use App\Support\Cache;
use App\Support\Cast;
use App\Support\Database;
use App\Support\Json;
use App\Support\Security;
use App\Support\Str;
use Illuminate\Http\Resources\Json\JsonResource;

trait HasBaseService {

    /**
     * @param  array<string, mixed> $params
     * @param  array<string, mixed> $scopes
     * @param  list<string> $permissions
     */
    public function index ( array $params = [], array $scopes = [], array $permissions = [] ): mixed {

        $key = Arr::except($this->buildParams($params, $scopes, $permissions), ['callback']) + ['type' => 'index'];

        return $this->successRemember($this->tag(), $key, fn () => $this->repository->index($params, $scopes, $permissions));

    }
    /**
     * @param  array<string, mixed> $scopes
     * @param  list<string> $permissions
     */
    public function show ( string $id, array $scopes = [], array $permissions = [] ): mixed {

        $key = ['id' => $id, 'scope' => $scopes, 'permission' => $permissions, 'type' => 'show'];

        return $this->successRemember($this->tag(), $key, fn () => $this->repository->show($id, $scopes, $permissions));

    }
    /**
     * @param  array<string, mixed> $params
     * @param  array<string, mixed> $scopes
     * @param  list<string> $permissions
     * @return array<string, mixed>
     */
    public function statistics ( array $params = [], array $scopes = [], array $permissions = [] ): array {

        $key = Arr::except($this->buildParams($params, $scopes, $permissions), ['callback']) + ['type' => 'statistics'];

        $result = $this->successRemember($this->tag(), $key, fn () => $this->repository->statistics($params, $scopes, $permissions));

        return is_array($result) ? $result : [];

    }
    /** @param array<string, mixed> $data */
    public function store ( array $data ): mixed {

        $result = Database::transaction(fn () => $this->repository->store($data));

        $this->deleteCache($this->tag());

        return $result;

    }
    /** @param array<string, mixed> $data */
    public function update ( string $id, array $data ): mixed {

        $result = Database::transaction(fn () => $this->repository->update($id, $data));

        $this->deleteCache($this->tag());

        return $result;

    }
    public function delete ( string $id ): bool {

        $result = Database::transaction(fn () => $this->repository->delete($id));

        $this->deleteCache($this->tag());

        return $result;

    }
    /**
     * @param  array<string, mixed> $params
     * @param  array<string, mixed> $scopes
     * @param  list<string> $permissions
     */
    public function related ( string $id, string $relation, array $params = [], array $scopes = [], array $permissions = [], bool $one = false, ?string $relatedId = null ): mixed {

        return $this->repository->related($id, $relation, $params, $scopes, $permissions, $one, $relatedId);

    }
    /** @param list<string> $ids */
    public function deleteMany ( array $ids ): int {

        $result = Database::transaction(fn () => $this->repository->deleteMany($ids));

        $this->deleteCache($this->tag());

        return $result;

    }
    /**
     * @param  array<string, mixed> $params
     * @param  array<string, mixed> $scopes
     * @param  list<string> $permissions
     * @param  list<callable> $callbacks
     * @return array<string, mixed>
     */
    public function buildParams ( array $params = [], array $scopes = [], array $permissions = [], array $callbacks = [] ): array {

        return [
            'id'         => $params['ids'] ?? null,
            'text'       => Cast::string($params['search'] ?? null),
            'page'       => Cast::integer($params['page'] ?? null),
            'limit'      => Cast::integer($params['limit'] ?? null),
            'sortBy'     => Cast::string($params['sort'] ?? null),
            'cursor'     => Cast::string($params['cursor'] ?? null),
            'filter'     => Cast::array($params['filters'] ?? []),
            'field'      => Cast::array($params['fields'] ?? []),
            'scope'      => $scopes,
            'permission' => $permissions,
            'callback'   => $callbacks,
        ];

    }
    /** @param array<mixed> $key */
    public function successRemember ( string $tag, array $key, \Closure $fn ): mixed {

        return Cache::remember($this->cacheKey($tag, $key), $this->ttl(), $fn, [$tag]);

    }
    /** @return class-string<JsonResource> */
    public function resource (): string {

        $class = 'App\\Http\\Resources\\' . $this->name() . 'Resource';

        if ( ! is_subclass_of($class, JsonResource::class) ) throw new \RuntimeException('Resource not found: ' . $class);

        return $class;

    }
    protected function deleteCache ( string $tag ): void {

        Cache::reset($tag);

    }
    /** @param array<mixed> $key */
    protected function cacheKey ( string $tag, array $key ): string {

        return $tag . ':' . Security::digest(Json::encode($key));

    }
    protected function tag (): string {

        return Str::plural(Str::snake($this->name()));

    }
    protected function name (): string {

        return Str::before(Str::afterLast(static::class, '\\'), 'Service');

    }
    protected function ttl (): int {

        return 300;

    }

}
