<?php

namespace App\Repositories;
use App\Models\RoomAction;

class RoomActionRepository extends BaseRepository {

    public function __construct( RoomAction $model) { parent::__construct($model); }

}
