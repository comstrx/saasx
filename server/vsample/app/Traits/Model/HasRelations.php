<?php

namespace App\Traits\Model;
use Illuminate\Support\Str;

trait HasRelations {

    use HasHelpers, HasDeepRelations;
    protected static array $cachedRelations = [];

    protected static function bootHasRelations () {

        if ( in_array('relations', (new static)->disabledTraits ?? []) ) return;

        foreach ( (new static)->getModelRelations() as $relation ) {

            static::resolveRelationUsing($relation['name'], fn($instance) => $instance->deepRelationsParser($relation));

        }

    }
    public function getModelRelations () {
        
        return rememberForever(static::class, 'generatedRelations', fn() => $this->resolveAllRelations(static::class, 1));

    }

    protected function resolveBelongsToChains ( string $model, string $prefix = '', array $visited = [], int $maxDepth = null ) {

        $chains = [];

        foreach ( getTablecolumns((new $model)->getTable()) as $column ) {

            if ( !str_ends_with($column, '_id') ) continue;

            $relatedName  = Str::beforeLast($column, '_id');
            $relatedClass = $this->resolveModelClass($relatedName, $model);

            if ( in_array($relatedClass, $visited) || !class_exists($relatedClass) ) continue;

            $relatedTable = (new $relatedClass)->getTable();
            $relationName = Str::camel($relatedName);
            
            $name = $prefix ? "{$prefix}.{$relationName}" : $relationName;
            $chains[]  = ['name' => $name, 'model' => $relatedClass, 'table' => $relatedTable];

            $depthExceeded = $maxDepth && substr_count($name, '.') >= ($maxDepth - 1);
            $nestedChains  = $depthExceeded ? [] : $this->resolveBelongsToChains($relatedClass, $name, [...$visited, $model]);
           
            $chains = array_merge($chains, $nestedChains);

        }

        return $chains;

    }
    protected function resolveBelongsToManyChains ( string $model ) {

        $modelName = (new $model)->getModelName();
        $chains    = [];

        foreach ( $this->getAllModels() as $targetClass ) {

            $pivotTable = (new $targetClass)->getTable();
            if ( !Str::contains($pivotTable, '_') ) continue;

            [$first, $second] = explode('_', $pivotTable);
            [$first, $second] = [strtolower(Str::singular($first)), strtolower(Str::singular($second))];
          
            if ( $first !== strtolower($modelName) && $second !== strtolower($modelName) ) continue;
          
            $relatedModel = $first === strtolower($modelName) ? $second : $first;
            $relatedClass = $this->resolveModelClass($relatedModel, $model);
        
            if ( !class_exists($relatedClass) ) continue;

            $name = Str::plural(Str::camel($relatedModel));
            $chains[] = ['name' => $name, 'model' => $relatedClass, 'table' => $pivotTable];

        }

        return $chains;

    }
    protected function resolveHasManyChains ( string $model, string $prefix = '', array $visited = [], int $maxDepth = null ) {

        $chains = [];

        foreach ( $this->getAllModels() as $targetClass ) {

            if ( in_array($targetClass, $visited) ) continue;
            $table = (new $targetClass)->getTable();

            foreach ( getTablecolumns($table) as $column ) {

                $relatedModel = $this->resolveModelClass(Str::beforeLast($column, '_id'), $targetClass);
                if ( $relatedModel !== $model || !str_ends_with($column, '_id') ) continue;

                $relationName = Str::plural((new $targetClass)->getModelName());

                $name = $prefix ? "{$prefix}.{$relationName}" : $relationName;
                $chains[]  = ['name' => $name, 'model' => $targetClass, 'table' => $table];

                $depthExceeded = $maxDepth && substr_count($name, '.') >= ($maxDepth - 1);
                $nestedChains  = $depthExceeded ? [] : $this->resolveHasManyChains($targetClass, $name, [...$visited, $model]);
              
                $chains = array_merge($chains, $nestedChains);
                break;

            }
        }

        return $chains;

    }
    protected function resolveMorphManyChains ( string $model ) {

        $chains = [];

        foreach ( $this->getAllModels() as $targetClass ) {

            if ( empty($this->resolveModelMorphs($targetClass)) || !method_exists(new $targetClass, 'getModelName') ) continue;
         
            $table = (new $targetClass)->getTable();
            $name  = Str::plural((new $targetClass)->getModelName());
           
            $chains[] = ['name' => $name, 'model' => $targetClass, 'table' => $table];

        }
        
        return $chains;

    }
    protected function transformChains ( string $model, string $type = null, array $chains = [] ) {

        $relations = [];

        foreach ( $chains as $chain ) {
            
            $name = lcfirst(implode('', array_map('Str::studly', explode('.', $chain['name']))));
            $name = str_contains(strtolower($type), 'many') ? Str::plural($name) : Str::singular($name);
          
            $segments  = explode('.', $chain['name']);
            $modelName = Str::studly(Str::singular(end($segments)));
          
            $chain = ['name' => $name, 'type' => $type, 'key' => $chain['name'], 'model' => $chain['model'], 'table' => $chain['table']];
            $relations[] = $chain;
           
            if ( count($segments) === 1 && strtolower($modelName) === strtolower((new $model)->getModelName()) ) {

                $chain['name'] = str_contains(strtolower($type), 'many') ? 'childrens' : ($type === 'belongsTo' ? 'parent' : 'children');
                $relations[] = $chain;

            }

        }

        return collect($relations)->lazy()->unique('name')->values()->all();

    }

    protected function resolveDynamicRelations ( string $model, int $maxDepth = null ) {

        $hasMany       = $this->resolveHasManyChains($model, maxDepth: $maxDepth);
        $morphMany     = $this->resolveMorphManyChains($model);
        $belongsTo     = $this->resolveBelongsToChains($model, maxDepth: $maxDepth);
        $belongsToMany = $this->resolveBelongsToManyChains($model);

        return collect([
            $this->transformChains($model, 'belongsTo', $belongsTo),
            $this->transformChains($model, 'belongsToMany', $belongsToMany),
            $this->transformChains($model, 'hasMany', $hasMany),
            $this->transformChains($model, 'hasOne', $hasMany),
            $this->transformChains($model, 'morphMany', $morphMany),
            $this->transformChains($model, 'morphOne', $morphMany),
        ])->lazy()->flatten(1)->values();

    }
    protected function resolveStaticRelations ( string $model, int $maxDepth = null ) {

        return collect($this->relationPreference ?? [])->map(function ($value, $key) {

            $relationKey  = is_array($value) ? $value[0] : $value;
            $foreignKeys  = is_array($value) ? $value[1] ?? null : null;
            $localKeys    = is_array($value) ? $value[2] ?? null : null;
            $customType   = is_array($value) ? $value[3] ?? null : null;
            $table        = is_array($value) ? $value[4] ?? null : null; 
            $model        = $this->getModelClass(last(explode('.', $relationKey)));
            
            $type = $customType ?? (
                !empty($this->resolveModelMorphs($model)) ?
                    (str_ends_with($key, 's') ? 'morphMany' : 'morphOne') :
                    (str_ends_with($key, 's') ? 'hasMany' : (str_ends_with($relationKey, 's') ? 'hasOne' : 'belongsTo'))
            );
            return [
                'name'        => $key,
                'type'        => $type,
                'model'       => $model,
                'table'       => $table,
                'key'         => $relationKey,
                'localKeys'   => $localKeys,
                'foreignKeys' => $foreignKeys,
            ];

        })->lazy()->values();

    }
    protected function resolveAllRelations ( string $model, int $maxDepth = null ) {

        $priority = ['belongsTo' => 6, 'belongsToMany' => 5, 'hasMany' => 4, 'morphMany' => 3, 'hasOne' => 2, 'morphOne' => 1];

        $static    = $this->resolveStaticRelations($model, $maxDepth);
        $dynamic   = $this->resolveDynamicRelations($model, $maxDepth);
        $allChains = $dynamic->map(fn($rel) => $static->firstWhere('name', $rel['name']) ?? $rel)->concat($static);

        return $allChains->sortByDesc(fn($rel) => $priority[$rel['type']])->unique('name')->values()->all();

    }

}
