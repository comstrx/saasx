<?php

namespace App\Traits\Bases;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

trait HasBaseResource {

    protected bool
        $translation    = true,
        $relations      = true,
        $hasImage       = false,
        $hasAttachments = false,
        $hasQrcode      = false,
        $hasQrcodes     = false,
        $hasPermissions = false;

    public function toArray ( Request $request ) {

        if ( !isset($this->resource->id) ) return null;

        return [
            ...self::info($this, $this->translation),
            ...($this->hasAttachments ? ['attachments' => $this->getAttachmentsResource()] : []),
            ...($this->hasQrcodes ? ['qrcodes' => $this->getQrcodesResource()] : []),
            ...($this->hasPermissions ? ['permissions' => $this->allowedPermissions()] : []),
            ...(method_exists($this, 'data') ? $this->translate($this->data()) : []),
            ...(method_exists($this, 'relations') && $this->relations ? $this->relations() : []),
        ];

    }
    public static function info ( $resource, bool $translation = true ) {

        if ( !isset($resource->id)) return [];

        $instance = (new static($resource));
        $instance->translation = $translation;

        return [
            'id'         => $resource->id,
            'ref_id'     => $resource->ref_id,
            'created_at' => $resource->formatDate('created_at'),
            'updated_at' => $resource->formatDate('updated_at'),
            
            ...(user_role() === 'admin' ? ['active' => $resource->active, 'notes' => $resource->notes] : []),
            ...(user_role() === 'vendor' ? ['allow' => $resource->allow] : []),
            ...(($instance->hasImage || $instance->hasAttachments) ? ['image' => $resource->getImage()] : []),
            ...(($instance->hasQrcode || $instance->hasQrcodes) ? ['qrcode' => $resource->getQrcode()] : []),
            ...(method_exists($instance, 'tiny') ? $instance->translate($instance->tiny($resource)) : []),
            ...(method_exists($instance, 'stats') ? $instance->translate($instance->stats()) : []),
        ];

    }
    public static function make ( ...$parameters ) {

        $resource = new static($parameters[0] ?? null);
        $resource->translation = $parameters[1] ?? false;
        $resource->relations = $parameters[2] ?? true;
        return $resource;

    }
    public static function collectionInfo ( $resource ) {

        if ( !($resource instanceof Collection) ) return collect();
        return $resource->map(fn($item) => self::info($item));

    }
    public static function collection ( $resource ) {

        if ( !($resource instanceof Collection) ) return collect();
        return parent::collection($resource);

    }
    public function translate ( $resource ) {

        if ( !$this->translation && in_array(user_role(), ['admin', 'vendor']) && !bool(request()->input('read_only')) ) return $resource;

        return collect($resource)->mapWithKeys(function( $value, $key ) {

            if ( !is_array($value) || !collect($value)->hasAny(locales()) ) return [$key => $value];
            else return [$key => $value[locale()] ?? collect($value)->first()];

        })->all();

    }

}
