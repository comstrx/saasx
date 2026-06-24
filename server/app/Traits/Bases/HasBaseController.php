<?php

declare(strict_types=1);

namespace App\Traits\Bases;
use App\Http\Requests\BaseRequest;
use App\Support\Arr;
use App\Support\Cast;
use App\Support\Context;
use App\Support\Parse;
use App\Support\Response;
use App\Support\Str;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

trait HasBaseController {

    public function index ( Request $request ): JsonResponse {

        return $this->respond($this->service->index($request->all(), $this->defaultScopes(), $this->defaultPermissions()));

    }
    public function statistics ( Request $request ): JsonResponse {

        return $this->respond($this->service->statistics($request->all(), $this->defaultScopes(), $this->defaultPermissions()));

    }
    public function show ( Request $request, string $id ): JsonResponse {

        return $this->respond($this->service->show($id, $this->defaultScopes(), $this->defaultPermissions()));

    }
    public function store ( BaseRequest $request ): JsonResponse {

        return $this->shaped($this->service->store($this->validated($request)), 201);

    }
    public function update ( BaseRequest $request, string $id, ?string $column = null ): JsonResponse {

        $data = $this->validated($request);

        if ( $column !== null ) $data = Arr::only($data, [$column]);

        return $this->shaped($this->service->update($id, $data));

    }
    public function delete ( Request $request, string $id ): JsonResponse {

        return Response::success(['deleted' => $this->service->delete($id)]);

    }
    public function deleteMany ( Request $request ): JsonResponse {

        return Response::success(['deleted' => $this->service->deleteMany($this->ids($request))]);

    }
    public function related ( Request $request, string $id, string $relation ): JsonResponse {

        return $this->relation($request, $id, $relation, false);

    }
    public function showRelated ( Request $request, string $id, string $relation, string $relatedId ): JsonResponse {

        return $this->relation($request, $id, $relation, true, $relatedId);

    }
    /** @return array<string, mixed> */
    protected function defaultScopes ( bool $strict = false ): array {

        return match ( Context::role() ) {
            'super', 'admin' => [],
            'vendor'         => $strict ? ['active' => true, 'vendor_id' => Context::userId()] : ['active' => true],
            'affiliate'      => $strict ? ['active' => true, 'affiliate_id' => Context::userId()] : ['active' => true],
            'delivery'       => $strict ? ['active' => true, 'delivery_id' => Context::userId()] : ['active' => true],
            default          => $strict ? ['active' => true, 'user_id' => Context::userId()] : ['active' => true],
        };

    }
    /** @return list<string> */
    protected function defaultPermissions (): array {

        return match ( Context::role() ) {
            'super', 'admin' => [],
            default          => ['allow'],
        };

    }
    protected function relation ( Request $request, string $id, string $relation, bool $one, ?string $relatedId = null ): JsonResponse {

        $result = $this->service->related($id, $relation, $request->all(), $this->defaultScopes(), $this->defaultPermissions(), $one, $relatedId);

        return $result === null ? Response::error('relation', 'Unknown relation.', 404) : $this->respond($result);

    }
    protected function respond ( mixed $result, int $status = 200 ): JsonResponse {

        if ( is_array($result) && array_key_exists('items', $result) ) return Response::success($result['items'] ?? null, $status, ['meta' => $result['meta'] ?? []]);

        if ( is_array($result) && array_key_exists('item', $result) ) return Response::success($result['item'] ?? null, $status);

        return Response::success($result, $status);

    }
    protected function shaped ( mixed $model, int $status = 200 ): JsonResponse {

        $resource = $this->service->resource();

        return Response::success($resource::make($model), $status);

    }
    /** @return array<string, mixed> */
    protected function validated ( BaseRequest $request ): array {

        $class = $this->requestClass();

        if ( $class !== null ) {

            $resolved = app($class);

            if ( $resolved instanceof BaseRequest ) $request = $resolved;

        }

        return $request->validated();

    }
    /** @return class-string<BaseRequest>|null */
    protected function requestClass (): ?string {

        $class = 'App\\Http\\Requests\\' . $this->name() . 'Request';

        return is_subclass_of($class, BaseRequest::class) ? $class : null;

    }
    /** @return list<string> */
    protected function ids ( Request $request ): array {

        $ids = $request->input('ids', []);

        return is_array($ids) ? Cast::values($ids) : Parse::items((string) $ids);

    }
    protected function name (): string {

        return Str::before(Str::afterLast(static::class, '\\'), 'Controller');

    }

}
