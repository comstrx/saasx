<?php

declare(strict_types=1);

namespace App\Traits\Bases;
use App\Support\Arr;
use App\Support\Response;
use App\Support\Str;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

trait HasBaseResource {

    /** @return array<string, mixed> */
    public function toArray ( Request $request ): array {

        return $this->shape($this->fields($request)) + $this->relations($request);

    }
    /** @return array<string, mixed> */
    public function fields ( Request $request ): array {

        return $this->resource instanceof Model ? $this->resource->attributesToArray() : [];

    }
    public static function single ( mixed $model, int $status = 200, array $extra = [] ): JsonResponse {

        return Response::success(static::make($model), $status, $extra);

    }
    public static function list ( mixed $items, int $status = 200, array $extra = [] ): JsonResponse {

        return Response::success(static::collection($items), $status, $extra);

    }
    /**
     * @param  array<string, mixed> $fields
     * @return array<string, mixed>
     */
    protected function shape ( array $fields ): array {

        return Arr::whereNotNull($fields);

    }
    /** @return array<string, mixed> */
    protected function relations ( Request $request ): array {

        if ( ! $this->resource instanceof Model ) return [];

        $result = [];

        foreach ( $this->resource->getRelations() as $name => $related ) {

            $result[$name] = $this->renderRelation($related);

        }

        return $result;

    }
    protected function renderRelation ( mixed $related ): mixed {

        if ( $related instanceof Model ) {

            $resource = $this->resourceFor($related::class);

            return $resource === null ? $related->attributesToArray() : $resource::make($related);

        }

        if ( $related instanceof EloquentCollection ) {

            $first = $related->first();
            $resource = $first instanceof Model ? $this->resourceFor($first::class) : null;

            return $resource === null ? $related->toArray() : $resource::collection($related);

        }

        return $related;

    }
    /**
     * @param  class-string $model
     * @return class-string<JsonResource>|null
     */
    protected function resourceFor ( string $model ): ?string {

        $class = 'App\\Http\\Resources\\' . Str::afterLast($model, '\\') . 'Resource';

        return is_subclass_of($class, JsonResource::class) ? $class : null;

    }

}
