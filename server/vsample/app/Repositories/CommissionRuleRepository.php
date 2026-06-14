<?php

namespace App\Repositories;
use App\Models\CommissionRule;

class CommissionRuleRepository extends BaseRepository {

    public function __construct( CommissionRule $model ) { parent::__construct($model); }

}
