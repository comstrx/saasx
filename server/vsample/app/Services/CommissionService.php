<?php

namespace App\Services;
use App\Repositories\CommissionRepository;

class CommissionService extends BaseService {
  
    public function __construct(
        protected CommissionRepository $commissionRepository,
    ) { parent::__construct($commissionRepository); }

}
