<?php

namespace App\Traits\Model\Search;
use App\Traits\Model\HasHelpers;
use App\Traits\Model\HasFillable;

trait Helpers {

    use HasHelpers, HasFillable;
    protected array $metaData = [], $permissions = [];

    protected function initMeta () {

        return [
            'page' => 1,
            'limit' => 10,
            'total' => 0,
            'search' => null,
            'sort' => 'newest',
            'filters' => [],
            'ids' => [],
        ];

    }
    protected function setMeta ( string|array $key = null, mixed $value = null ) {

        $this->metaData = array_replace_recursive(
            $this->initMeta(),
            $this->metaData,
            is_array($key) ? $key : ($key ? [$key => $value] : [])
        );

        return $this;

    }
    protected function getMeta ( string $key = null, mixed $value = null ) {

        if ( empty($this->metaData) ) $this->setMeta();
        if ( $key && $value ) $this->setMeta($key, $value);
        
        return !$key ? $this->metaData : ($this->metaData[$key] ?? null);

    }
    protected function clearMeta () {

        $this->metaData = $this->initMeta();
        return $this;

    }

    protected function setPermissions ( string|array $permissions = null ) {

        $this->permissions = array_merge($this->permissions, (array) $permissions);
        return $this;

    }
    protected function getPermissions () {

        return $this->permissions;

    }
    protected function clearPermissions () {

        $this->permissions = [];
        return $this;

    }

}
