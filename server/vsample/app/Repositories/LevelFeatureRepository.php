<?php

namespace App\Repositories;
use App\Models\LevelFeature;

class LevelFeatureRepository extends BaseRepository {

    public function __construct( LevelFeature $model ) { parent::__construct($model); }

}
