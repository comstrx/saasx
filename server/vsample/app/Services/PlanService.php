<?php

namespace App\Services;
use App\Repositories\PlanRepository;

class PlanService extends BaseService {
   
    public function __construct(
        protected PlanRepository $planRepository
    ) { parent::__construct($planRepository); }

}
