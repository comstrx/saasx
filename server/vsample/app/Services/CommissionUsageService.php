<?php

namespace App\Services;
use App\Repositories\CommissionUsageRepository;

class CommissionUsageService extends BaseService {
  
    public function __construct(
        protected CommissionUsageRepository $commissionUsageRepository,
    ) { parent::__construct($commissionUsageRepository); }

}
