<?php

namespace App\Repositories;
use App\Models\Zone;

class ZoneRepository extends BaseRepository {

    public function __construct( Zone $model ) { parent::__construct($model); }

    public function findByName ( string $name ) {

        return parent::query()->where('name', $name)->verified()->first();

    }

}
