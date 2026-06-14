<?php

namespace App\Repositories;
use App\Models\Entity;

class EntityRepository extends BaseRepository {

    public function __construct( Entity $model ) { parent::__construct($model); }

}
