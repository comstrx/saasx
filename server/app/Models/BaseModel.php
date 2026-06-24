<?php

declare(strict_types=1);

namespace App\Models;
use App\Support\Database;
use App\Traits\Bases\HasBaseModel;
use Illuminate\Database\Eloquent\Model;

abstract class BaseModel extends Model {

    use HasBaseModel;

    protected $keyType = 'string';
    public $incrementing = false;

    protected static function booted (): void {

        static::creating(static function ( BaseModel $model ): void {

            if ( $model->getKey() === null ) $model->setAttribute($model->getKeyName(), Database::uuid());

        });

    }

}
