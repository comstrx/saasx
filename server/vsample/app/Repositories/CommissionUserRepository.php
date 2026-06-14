<?php

namespace App\Repositories;
use App\Models\CommissionUser;

class CommissionUserRepository extends BaseRepository {

    public function __construct( CommissionUser $model ) { parent::__construct($model); }

}
