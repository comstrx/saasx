<?php

namespace App\Repositories;
use App\Models\View;

class ViewRepository extends BaseRepository {

    public function __construct( View $model ) { parent::__construct($model); }

}
