<?php

namespace App\Repositories;
use App\Models\Level;

class LevelRepository extends BaseRepository {

    public function __construct( Level $model ) { parent::__construct($model); }

}
