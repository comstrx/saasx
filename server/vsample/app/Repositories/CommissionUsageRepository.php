<?php

namespace App\Repositories;
use App\Models\CommissionUsage;

class CommissionUsageRepository extends BaseRepository {

    public function __construct( CommissionUsage $model ) { parent::__construct($model); }

}
