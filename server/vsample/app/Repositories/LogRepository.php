<?php

namespace App\Repositories;
use App\Models\Log;

class LogRepository extends BaseRepository {

    public function __construct( Log $model ) { parent::__construct($model); }

}
