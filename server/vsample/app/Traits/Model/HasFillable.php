<?php

namespace App\Traits\Model;

trait HasFillable {
  
    use HasHelpers;
    protected static array $tableSchemaCache = [];

    protected function uniqueArray ( ...$arrays ) {

        $result = [];

        foreach ( $arrays as $array ) {

            foreach ( $array as $key => $value ) {

                if ( !array_key_exists($key, $result) ) $result[$key] = $value;

            }
            
        }

        return $result;

    }
    protected function tableSchema () {

        return once(fn() => static::$tableSchemaCache[$this->getTable()] ??= $this->getTableSchema());

    }
    protected function generateFillable () {

        $systemColumns = ['id', 'created_at', 'updated_at', 'deleted_at'];
        return array_diff(array_keys($this->tableSchema()), $systemColumns, $this->notFillable ?? []);

    }
    protected function generateFilterable () {

        return array_diff(array_keys($this->tableSchema()), $this->notFilterable ?? [], $this->getHidden());

    }
    protected function generateSearchable () {

        $columns = collect($this->tableSchema())->filter(fn ($type) =>
            str_contains($type, 'text') ||
            str_contains($type, 'varchar') ||
            str_contains($type, 'json') ||
            str_contains($type, 'date') ||
            str_contains($type, 'time') ||
            str_contains($type, 'enum')
        )->keys()->toArray();

        return array_diff($columns, $this->notSearchable ?? [], $this->getHidden());

    }
    protected function generateCasts () {

        return collect($this->tableSchema())->map(function ( $type, $column ) {

            return match (true) {
                str_contains($type, 'timestamp') || str_contains($type, 'datetime') => 'datetime',
                str_contains($type, 'json') || str_contains($type, 'text json') => 'array',
                str_contains($type, 'tinyint(1)') => 'boolean',
                default => null,
            };

        })->filter(fn($column) => $column)->toArray();

    }
    public function getFillable () {
        
        return array_values($this->uniqueArray(array_merge($this->generateFillable(), (array) $this->fillable ?? [])));
    
    }
    public function getCasts () {
        
        return $this->uniqueArray(array_merge($this->generateCasts(), (array) $this->casts ?? []));
    
    }
    public function getSearchable () {
        
        return $this->uniqueArray(array_merge($this->generateSearchable(), (array) $this->searchable ?? []));
    
    }
    public function getFilterable () {
        
        return $this->uniqueArray(array_merge($this->generateFilterable(), (array) $this->filterable ?? []));
    
    }
    public function getHidden () {
        
        return $this->uniqueArray(array_merge(['password'], (array) $this->hidden ?? []));
    
    }
    public function getFacetable () {
        
        return (array) $this->facetable ?? [];
    
    }
    public function getWithRelations () {
        
        return (array) $this->withRelations ?? [];
    
    }
    public function getWithAggregates () {
        
        return (array) $this->withAggregates ?? [];
    
    }
    public function getCallbackSearchable () {
        
        return $this->callbackSearchable ?? [];
    
    }
    public function getShouldEagerLoad () {
        
        return (bool)($this->shouldEagerLoad ?? true);
    
    }
    
}
