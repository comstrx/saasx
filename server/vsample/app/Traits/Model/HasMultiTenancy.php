<?php

namespace App\Traits\Model;
use Illuminate\Database\Query\JoinClause;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

trait HasMultiTenancy {

    use HasHelpers;

    protected static function bootHasMultiTenancy () {

        if ( in_array('tenancy', (new static)->disabledTraits ?? []) ) return;

        static::addGlobalScope('tenant', function ( Builder $builder ) {
            
            if ( static::shouldApply() ) (new static)->scopeWithTenant($builder);

        });
        static::creating(function ( Model $model ) {
            
            if ( static::shouldApply() && is_null($model->{static::tenantColumn()}) ) $model->{static::tenantColumn()} = static::tenantId();
            
        });
        static::deleting(function ( Model $model ) {
            
            if ( static::shouldApply() && $model->{static::tenantColumn()} !== static::tenantId() ) abort(403);

        });

    }
    protected static function tenantColumn () {

        return property_exists(static::class, 'tenantColumn') ? (new static)->tenantColumn : 'store_id';

    }
    protected static function tenantId () {
        
        return app()->bound('store') ? app('store')->id : null;

    }
    protected static function shouldApply () {

        return (new static)->hasColumn( static::tenantColumn() ) && static::tenantId();

    }
    public function scopeWithTenant ( Builder $query, int $tenantId = null ) {

        if ( static::shouldApply() ) {

            [$id, $column] = [$tenantId ?? static::tenantId(), static::tenantColumn()];
            $query->where("{$this->getTable()}.{$column}", '=', $id);

            foreach ( $query->getQuery()->joins ?? [] as $join ) {

                if ( $join instanceof JoinClause ) {

                    $joinTable = $join->table;

                    if ( tableHasColumn($joinTable, $column) ) {
                        
                        $query->where("{$joinTable}.{$column}", '=', $id);

                    }

                }

            }

        }

    }
    public function scopeWithoutTenant ( Builder $query ) {
        
        return $query->withoutGlobalScope('tenant');
    
    }
    public function scopeForTenant ( Builder $query, int $tenantId = null ) {

        return $tenantId ? $query->withoutTenant()->withTenant($tenantId) : $query->withoutTenant();

    }
    public static function insert ( array $data = [] ) {

        $now         = now();
        $id          = static::tenantId();
        $column      = static::tenantColumn();
        $timeStamp   = (new static)->usesTimestamps();
        $shouldApply = static::shouldApply();

        if ( $shouldApply || $timeStamp ) {

            $data = collect($data)->map(function ($item) use ( $now, $id, $column, $timeStamp, $shouldApply ) {

                if ( $shouldApply && !isset($item[$column]) ) $item[$column] = $id;

                if ( $timeStamp ) {
                    if ( !isset($item['created_at']) ) $item['created_at'] = $now;
                    if ( !isset($item['updated_at']) ) $item['updated_at'] = $now;
                }

                return $item;

            })->toArray();
        }

        return static::query()->insert($data);

    }

}
