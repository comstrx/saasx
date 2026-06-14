<?php

namespace App\Traits\Model;
use Staudenmeir\EloquentHasManyDeep\HasRelationships;
use Illuminate\Support\Str;

trait HasDeepRelations {

    use HasRelationships, HasHelpers;

    public function deepRelationParams ( string|array $relation = null, string|array $foreignKey = null, string|array $localkey = null ) {

        $parts       = is_array($relation) ? $relation : explode('.', $relation);
        $related     = $this->resolveModelClass(array_pop($parts));
        $through     = array_map(fn($part) => $this->resolveModelClass($part), $parts);
        $localKeys   = array_pad((array) $localkey, count($through) + 1, null);
        $foreignKeys = array_pad((array) $foreignKey, count($through) + 1, null);

        return compact('related', 'through', 'foreignKeys', 'localKeys');

    }
    public function deepRelationsParser ( array $params = [] ) {

        $params = optional($params);

        $key         = $params['key'];
        $type        = $params['type'];
        $table       = $params['table'];
        $foreignKeys = $params['foreignKeys'];
        $localKeys   = $params['localKeys'];

        return match ( strtolower($type) ) {
            'hasmany'       => $this->deepHasMany($key, $foreignKeys, $localKeys),
            'hasone'        => $this->deepHasOne($key, $foreignKeys, $localKeys),
            'morphmany'     => $this->deepMorphMany($key, $foreignKeys, $localKeys),
            'morphone'      => $this->deepMorphOne($key, $foreignKeys, $localKeys),
            'belongsto'     => $this->deepBelongsTo($key, $foreignKeys, $localKeys),
            'belongstomany' => $this->deepBelongsToMany($key, $table, $foreignKeys, $localKeys),
            default         => $this->nullRelation('hasMany'),
        };

    }

    public function deepHasMany ( string|array $relation = null, string|array $foreignKey = null, string|array $localKey = null, bool $one = false ) {

        $params = $this->deepRelationParams($relation, $foreignKey, $localKey);

        $foreign = $params['foreignKeys'][0] ?? null;
        $local   = $params['localKeys'][0] ?? null;
        $related = $params['related'];

        if ( empty($params['through']) ) return $one ? $this->hasOne($related, $foreign, $local) : $this->hasMany($related, $foreign, $local);
        else return $one ? $this->hasOneDeep(...array_values($params)) : $this->hasManyDeep(...array_values($params));

    }
    public function deepMorphMany ( string|array $relation = null, string|array $foreignKey = null, string|array $localKey = null, bool $one = false ) {

        $params = $this->deepRelationParams($relation, $foreignKey, $localKey);

        $related = $params['related'];
        $keyName = method_exists($related, 'getMorphName') ? (new $related)->getMorphName() : ($related::$morphName ?? 'related');
        $params['foreignKeys'][count($params['through'])] = ["{$keyName}_type", "{$keyName}_id"];

        if ( empty($params['through']) ) return $one ? $this->morphOne($related, $keyName) : $this->morphMany($related, $keyName);
        else return $one ? $this->hasOneDeep(...array_values($params)) : $this->hasManyDeep(...array_values($params));

    }
    public function deepBelongsTo ( string|array $relation = null, string|array $foreignKey = null, string|array $localKey = null ) {

        $params = $this->deepRelationParams($relation, $foreignKey, $localKey);

        $related     = $params['related'];
        $through     = $params['through'];
        $localKeys   = $params['localKeys'];
        $foreignKeys = $params['foreignKeys'];
        $previous    = $this;
        $parts       = is_array($relation) ? $relation : explode('.', $relation);
        $keyName     = Str::snake(array_pop($parts) . '_id');

        if ( empty($through) ) return $this->belongsTo($related, $foreignKeys[0] ?? $keyName);
        
        foreach ( $parts as $index => $step ) {

            $instance = $previous->$step();
            $previous = $instance->getRelated();

            $localKeys[$index] = $localKeys[$index] ?? $instance->getOwnerKeyName();
            $foreignKeys[$index] = $foreignKeys[$index] ?? $instance->getForeignKeyName();

        }

        $localKeys[count($through)] = $localKeys[count($through)] ?? (new $related)->getKeyName();
        $foreignKeys[count($through)] = $foreignKeys[count($through)] ?? $keyName;

        return $this->hasOneDeep($related, $through, $localKeys, $foreignKeys);

    }

    public function deepHasOne ( string|array $relation = null, string|array $foreignKey = null, string|array $localKey = null ) {

        return $this->deepHasMany($relation, $foreignKey, $localKey, true);

    }
    public function deepMorphOne ( string|array $relation = null, string|array $foreignKey = null, string|array $localKey = null ) {

        return $this->deepMorphMany($relation, $foreignKey, $localKey, true);

    }
    public function deepBelongsToMany ( string $relation = null, string $table = null, string|array $foreignKey = null, string|array $localKey = null ) {

        return $this->belongsToMany($this->resolveModelClass($relation), $table, ((array) $foreignKey)[0] ?? null, ((array) $foreignKey)[0] ?? null);

    }
    public function deepHasManyThrough ( string $relation = null, string|array $through = null, string|array $foreignKey = null, string|array $localKey = null ) {

        return $this->deepHasMany([...((array) $through), $relation], $foreignKey, $localKey);

    }
    public function deepHasOneThrough ( string $relation = null, string|array $through = null, string|array $foreignKey = null, string|array $localKey = null ) {

        return $this->deepHasOne([...((array) $through), $relation], $foreignKey, $localKey);

    }
    public function deepBelongsToThrough ( string $relation = null, string|array $through = null, string|array $foreignKey = null, string|array $localKey = null ) {

        return $this->deepBelongsTo([...((array) $through), $relation], $foreignKey, $localKey);

    }

}
