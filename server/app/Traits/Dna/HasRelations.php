<?php

declare(strict_types=1);

namespace App\Traits\Dna;
use App\Support\Arr;
use App\Support\Cast;
use App\Support\Log;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\Relation;

/** @mixin \Illuminate\Database\Eloquent\Model */
trait HasRelations {

    /** @var array<class-string, array<string, class-string>> */
    protected static array $relationMap = [];

    /** @var list<string> */
    protected array $requestedIncludes = [];

    /** @return array<string, class-string> */
    public function relations (): array {

        return self::$relationMap[static::class] ??= $this->discoverRelations();

    }
    public function hasRelation ( string $name ): bool {

        return Arr::has($this->relations(), $name);

    }
    /** @return Relation<Model, Model, mixed>|null */
    public function resolveRelation ( string $name ): ?Relation {

        if ( ! $this->hasRelation($name) ) return null;

        $relation = $this->{$name}();

        return $relation instanceof Relation ? $relation : null;

    }
    /**
     * @param  Builder<static> $query
     * @return Builder<static>
     */
    public function getWithRelations ( Builder $query, array $includes = [] ): Builder {

        $load = $includes === [] ? $this->requestedIncludes : $this->allowedIncludes($includes);

        return $load === [] ? $query : $query->with($load);

    }
    /**
     * @param  Builder<static> $query
     * @return Builder<static>
     */
    public function scopeWithIncludes ( Builder $query, array $includes ): Builder {

        $this->setIncludes($includes);

        return $query;

    }
    public function setIncludes ( array $includes ): void {

        $this->requestedIncludes = $this->allowedIncludes($includes);

    }
    /** @return array<string, class-string> */
    protected function discoverRelations (): array {

        $map = [];

        foreach ( ( new \ReflectionClass($this) )->getMethods(\ReflectionMethod::IS_PUBLIC) as $method ) {

            if ( $method->isStatic() || $method->getNumberOfParameters() > 0 ) continue;

            $type = $method->getReturnType();

            if ( ! $type instanceof \ReflectionNamedType || $type->isBuiltin() ) continue;

            $class = $type->getName();

            if ( $class !== Relation::class && ! is_subclass_of($class, Relation::class) ) continue;

            $relation = $this->{$method->getName()}();

            if ( $relation instanceof Relation ) $map[$method->getName()] = $relation->getRelated()::class;

        }

        return $map;

    }
    /**
     * @param  array<mixed> $includes
     * @return list<string>
     */
    protected function allowedIncludes ( array $includes ): array {

        $map = $this->relations();
        $result = [];

        foreach ( $includes as $include ) {

            $name = Cast::string($include);

            if ( $name === null ) continue;

            if ( Arr::has($map, $name) ) $result[] = $name;
            else Log::warning('relations.include.skip', ['relation' => $name]);

        }

        return $result;

    }

}
