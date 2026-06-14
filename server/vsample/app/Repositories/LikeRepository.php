<?php

namespace App\Repositories;
use App\Models\Like;

class LikeRepository extends BaseRepository {

    public function __construct( Like $model ) { parent::__construct($model); }

}
