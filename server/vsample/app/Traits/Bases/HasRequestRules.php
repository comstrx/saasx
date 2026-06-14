<?php

namespace App\Traits\Bases;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;

trait HasRequestRules {

    public function isRoute ( string|array $pattern = null ) {

        $pattern = (array) $pattern;
        return empty($pattern) ? true : ($this->routeIs($pattern) || $this->is($pattern) || $this->fullUrlIs($pattern));

    }
    public function checkRoute ( string $key, string $value = null ) {

        return $value ? strtolower($this->route($key)) == strtolower($value) : !empty($this->route($key));

    }
    public function requiredIfRoute ( string|array $pattern = null ) {

        return $this->isRoute($pattern) ? 'required' : 'nullable';

    }
    public function requiredIf ( string $condition, mixed $value = null ) {

        $isRequired = match ($condition) {
            'delete_batch' => $this->isMethod('delete') && !$this->route('id'),
            'delete'       => $this->isMethod('delete') && $this->route('id'),
            'index'        => $this->isMethod('get') && !$this->route('id'),
            'store'        => $this->isMethod('post') && !$this->route('id'),
            'show'         => $this->isMethod('get') && $this->route('id'),
            'update'       => $this->isMethod('put') || $this->isMethod('patch'),
            'get'          => $this->isMethod('get'),
            'post'         => $this->isMethod('post'),
            'put'          => $this->isMethod('put'),
            'patch'        => $this->isMethod('patch'),
            'route'        => $this->requiredIfRoute($value),
            default        => false
        };
    
        return $isRequired ? 'required' : 'nullable';

    }
    public function withDefault ( string|array $key, mixed $value ) {
        
        if ( is_array($key) ) $this->merge(collect($key)->filter(fn($v, $k) => !$this->has($k))->all());
        elseif ( !$this->has($key) ) $this->merge([$key => $value]);
        return $this;

    }
    public function stringRule ( bool $required = false, int $min = 0, int $max = 255, string|array $args = null ) {
        
        return array_filter([
            $required ? 'required' : 'nullable',
            'string',
            $min > 0 ? "min:$min" : null,
            $max > 0 ? "max:$max" : null,
            ...(array) $args
        ]);
    
    }
    public function textRule ( bool $required = false, int $min = 0, int $max = 65535, string|array $args = null ) {
        
        return $this->stringRule($required, $min, $max, $args);
    
    }
    public function longTextRule ( bool $required = false, int $min = 0, int $max = 16777215, string|array $args = null ) {
        
        return $this->stringRule($required, $min, $max, $args);
    
    }
    public function urlRule ( bool $required = false, int $min = 10, int $max = 2048, string|array $args = null ) {

        return $this->stringRule($required, $min, $max, [
            'url',
            'starts_with:http://,https://',
            'regex:/^https?:\/\/[a-z0-9\-\.]+(\:[0-9]+)?(\/[^\s]*)?$/i',
            ...(array) $args
        ]);
        
    }
    public function integerRule ( bool $required = false, int $min = 0, int $max = null, string|array $args = null ) {

        return array_filter([
            $required ? 'required' : 'nullable',
            'integer',
            "min:$min",
            $max > 0 ? "max:$max" : null,
            ...(array) $args
        ]);

    }
    public function floatRule ( bool $required = false, int $min = 0, int $max = null, string|array $args = null ) {

        return array_filter([
            $required ? 'required' : 'nullable',
            'numeric',
            "min:$min",
            $max > 0 ? "max:$max" : null,
            ...(array) $args
        ]);

    }
    public function arrayRule ( bool $required = false, int $min = null, int $max = null, string|array $args = null ) {

        return array_filter([
            $required ? 'required' : 'nullable',
            'array',
            $min > 0 ? "min:$min" : null,
            $max > 0 ? "max:$max" : null,
            ...(array) $args
        ]);

    }
    public function booleanRule ( bool $required = false, string|array $args = null ) {

        return array_filter([
            $required ? 'required' : 'nullable',
            'boolean',
            ...(array) $args
        ]);

    }
    public function dateRule ( bool $required = false, string $format = null, string|array $args = null ) {
        
        return array_filter([
            $required ? 'required' : 'nullable',
            'date',
            $format ? "date_format:$format" : null,
            'after:1900-01-01',
            ...(array) $args
        ]);

    }
    public function jsonRule ( bool $required = false, string|array $args = null ) {

        return array_filter([
            $required ? 'required' : 'nullable',
            'json',
            ...(array) $args
        ]);

    }
    public function fileRule ( bool $required = false, string|array $mimes = null, int $maxSize = null, string|array $args = null ) {
        
        return array_filter([
            $required ? 'required' : 'nullable',
            'file',
            $mimes ? 'mimes:' . implode(',', (array) $mimes) : null,
            !is_null($maxSize) ? "max:$maxSize" : null,
            ...(array) $args
        ]);

    }
    public function existsRule ( string $table, string $column = 'id', bool $required = false, bool $checkStore = true ) {

        $rule = Rule::exists($table, $column);
        if ( store_id() && $checkStore ) $rule = $rule->where('store_id', store_id());
        return [$required ? 'required' : 'nullable', $rule];

    }
    public function uniqueRule ( string $table, string $column = 'id', mixed $ignore = null ) {

        $rule = Rule::unique($table, $column);

        if ( $ignore === true && isset($this->id) ) $rule = $rule->ignore($this->id);
        elseif ( $ignore && $ignore !== true ) $rule = $rule->ignore($ignore);
        elseif ( in_array($this->method(), ['PUT', 'PATCH']) && isset($this->id) ) $rule = $rule->ignore($this->id);

        if ( store_id() ) $rule = $rule->where('store_id', store_id());
        return [$rule];

    }
    public function enumRule ( array|string $values, bool $required = false ) {

        return [$required ? 'required' : 'nullable', Rule::in((array) $values)];

    }
    public function slugRule ( bool $required = false ) {

        return $this->stringRule($required, 2, 255, 'regex:/^[a-z0-9\-]+$/');
        
    }
    public function amountRule ( bool $required = false ) {
        
        return $this->floatRule($required, 0, 1000000);
    
    }
    public function nameRule ( bool $required = false ) {
        
        return $this->stringRule($required, 2);

    }
    public function emailRule ( bool $required = false ) {
        
        return $this->stringRule($required, 3, 255, 'email');
    
    }
    public function phoneRule ( bool $required = false ) {
        
        return $this->stringRule($required, 3, 20, 'regex:/^\+?[1-9][0-9\-\(\)\s]{1,20}$/');
    
    }
    public function countryRule ( bool $required = false ) {
        
        return $this->stringRule($required, 2, 2);
    
    }
    public function currencyRule ( bool $required = false ) {

        return $this->stringRule($required, 3, 3);

    }
    public function languageRule ( bool $required = false ) {

        return $this->stringRule($required, 2, 2);

    }
    public function zipRule ( bool $required = false ) {
        
        return $this->stringRule($required, 3, 20, 'regex:/^[A-Za-z0-9\s\-]+$/');
    
    }
    public function latitudeRule ( bool $required = false ) {

        return $this->floatRule($required, -90, 90);

    }
    public function longitudeRule ( bool $required = false ) {

        return $this->floatRule($required, -180, 180);

    }
    public function genderRule ( bool $required = false ) {

        return $this->enumRule(['male', 'female', 'none'], $required);

    }
    public function themeRule ( bool $required = false ) {

        return $this->enumRule(['dark', 'light', 'default', 'system'], $required);

    }
    public function passwordRule ( bool $required = false, bool $strict = true, bool $confirmed = true ) {
        
        $args = [$strict ? 'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/' : null, $confirmed ? 'confirmed' : null];
        return $this->stringRule($required, 6, 255, $args);
    
    }
    public function customRule ( string $table, string $name, string $type, bool $required = false, bool $unique = false, array $values = [] ) {

        $method = method_exists($this, "{$name}Rule") ? "{$name}Rule" : null;
        $required = $required ? "\$this->required({$name}, true)" : "";
        $uniqueField = $name;

        $method = $method ?? match ( $type = strtolower($type) ) {
            in_array($type, ['text']) => "textRule",
            in_array($type, ['longtext']) => "longTextRule",
            in_array($type, ['integer', 'unsignedBigInteger']) => "integerRule",
            in_array($type, ['float', 'double', 'numeric']) => "floatRule",
            in_array($type, ['postal', 'zip_code']) => "zipRule",
            in_array($type, ['decimal']) => "amountRule",
            in_array($type, ['json']) => "jsonRule",
            in_array($type, ['array']) => "arrayRule",
            in_array($type, ['boolean']) => "booleanRule",
            in_array($type, ['date', 'datetime', 'timestamp']) => "dateRule",
            default => "stringRule"
        };
        if ( in_array($type, ['integer', 'unsignedBigInteger']) && str_contains($name, '_id') ) {

            $uniqueField = "id";
            $relationTable = Str::snake(Str::plural(str_replace('_id', '', $name)));
            
            if ( str_replace('_id', '', $name) !== 'parent' ) $table = $relationTable;
            if ( in_array(str_replace('_id', '', $name), ['admin', 'vendor', 'client', 'owner']) ) $table = 'users';

            $method = "existsRule( '{$table}', 'id'" . ($required ? ", {$required}" : "") . " )";

        }
        elseif ( $type === 'enum' ) {

            $values = collect($values)->map(fn($v) => "'{$v}'")->implode(', ');
            $method = "enumRule( [{$values}]" . ($required ? ", {$required}" : "") . " )";

        }
        else {

            $method = "{$method}(" . ($required ? " {$required} " : "") . ")";

        }

        if ( !$unique ) return "\$this->{$method}";
        return "[...\$this->{$method}, ...\$this->uniqueRule( '{$table}', '" . $uniqueField . "' )]";

    }

}
